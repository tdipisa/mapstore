/**
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * requires 
 * include 
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = DownloadPanel
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: DownloadPanel(config)
 *
 *    Plugin for manager WPS Download services 
 */   
gxp.plugins.DownloadPanel = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_download */
    ptype: "gxp_download",
    
    /** api: config[id]
     *  ``String``
     *  
     */
    id: "download",    
    
    /** api: config[container]
     *  ``String``
     */
    container: 'fieldset',   

	/** api: config[wpsUrl]
     *  ``String``
     */
	wpsUrl: null,
	
	/** api: config[gazetteerUrl]
     *  ``String``
     */
	gazetteerUrl: null,
	
	/** api: config[sridLinkTpl]
     *  ``String``
     */
	sridLinkTpl: null,
	
	/** api: config[initialText]
     *  ``String``
     */
	initialText: "Select an item ...",
	
	/** api: config[formats]
     *  ``Object``
     */
	formats: {
		wfs:[
			["application/zip", "ESRI Shapefile", "zip"],
			["application/dxf", "DXF", "dxf"],
			["application/gml-2.1.2", "GML2", "gml"],
			["application/gml-3.1.1", "GML3", "gml"]
		],
		wcs:[
			["image/tiff", "GeoTIFF", "tif"]
		]
	},
	
	/** api: config[targetCSR]
     *  ``Array``
     */
	targetCSR: [
		["EPSG:4326","EPSG:4326", "epsg", "4326"],
	],
	
	/** api: config[layerStore]
     *  ``Object``
     */
	layerStore: null,
	
    /** api: config[crsStore]
     *  ``Object``
     */
	crsStore: null,
	
	/** api: config[selectedLayer]
     *  ``Object``
     */
	selectedLayer: null,
	
	/** api: config[formPanel]
     *  ``Object``
     */
	formPanel: null,
    
    /** private: method[constructor]
     */
    constructor: function(config) {
        gxp.plugins.DownloadPanel.superclass.constructor.apply(this, arguments); 
    },   
	
	/** private: method[init]
     *  :arg target: ``Object``
	 * 
	 *  Provide the initialization code defining necessary listeners and controls.
     */
	init: function(target) {	
		target.on({
			'ready' : function(){
			    this.addLayerTool = app.tools["addlayer"];
				this.addLayerTool.on({
					'ready' : function(layerRecord){
						this.selectedLayer = layerRecord;
						
						// ///////////////////////////////////
						// As usual reload the Formats store
						// ///////////////////////////////////
						this.formatStore.removeAll();
						if(layerRecord.data.wcs === true){
							this.formatStore.loadData(this.formats.wcs, false);
						}else{
							this.formatStore.loadData(this.formats.wfs, false);
						}
					},
					scope: this
				});
				
				var map = this.target.mapPanel.map;
				
				// ///////////////////////////////////
				// Add Plugin controls Tools
				// ///////////////////////////////////
				this.spatialSelection = new OpenLayers.Layer.Vector("Spatial Selection",{
					displayInLayerSwitcher: false
				});
				
				this.spatialSelection.events.register("beforefeatureadded", this, function(){
					// //////////////////////////////////////////////////////
					// Remove the old features before drawing other features.
					// //////////////////////////////////////////////////////
					this.spatialSelection.removeAllFeatures();
				});
				
				var ev = map.events.register('addlayer', this, function(e){
					if( e.layer == this.spatialSelection ) 
						return;
					map.setLayerIndex(this.spatialSelection, map.layers.length - 1);
				});
				
				map.addLayers([this.spatialSelection]);
				
				this.drawControls = {
					polygon: new OpenLayers.Control.DrawFeature(this.spatialSelection,
						OpenLayers.Handler.Polygon),
                    box: new OpenLayers.Control.DrawFeature(this.spatialSelection,
                        OpenLayers.Handler.RegularPolygon, {
                            handlerOptions: {
                                sides: 4,
                                irregular: true
                            }
                        }
                    )
				};
				
				for(var key in this.drawControls) {
					this.target.mapPanel.map.addControl(this.drawControls[key]);
				}
			},
			scope: this
		});
        
		return gxp.plugins.DownloadPanel.superclass.init.apply(this, arguments);
    },
	
	/** private: method[reloadLayers]
	 * 
	 *  When the Layers Combo Box is expanded the function provides the Store 
	 *  synchronization with other WMS possibly added in the meantime. 
     */
	reloadLayers: function(){
		var source, data = [];   

		var layerSources = this.target.layerSources;
		
		for (var id in layerSources) {
			source = layerSources[id];
			
			// //////////////////////////////////////////////
			// Slide the array of WMS and concatenates the 
			// layers Records for the Store
			// //////////////////////////////////////////////
			switch(source.ptype){
				case "gxp_mapquestsource": continue;
				case "gxp_osmsource": continue;
				case "gxp_googlesource": continue;
				case "gxp_bingsource": continue;
				case "gxp_olsource": continue;
				case "gxp_wmssource": 
					var store = source.store;
					if (store) {
						var records = store.getRange();
						
						var size = store.getCount();
						for(var i=0; i<size; i++){
						    var record = records[i]; 
							
							if(record){
								var recordData = [id, record.data.name];
								
								// ////////////////////////////////////////////////////
								// The keyword control is necessary in order         //
								// to markup a layers as Raster or Vector in order   //
								// to set a proper format in the 'Format' combo box. //
								// ////////////////////////////////////////////////////
								var keywords = record.get("keywords");								
								if(keywords){
									for(var k=0; k<keywords.length; k++){
										var keyword = keywords[k].value || keywords[k];
										
										if(keyword.indexOf("WCS") != -1){
											recordData.push(true);
											break;
										}                       
									}
								}
								
								data.push(recordData);  
							}
						}              
					}
			}
		}

		this.layerStore.removeAll();
		this.layerStore.loadData(data, false);
	},
	
	/** private: method[resetForm]
	 * 
	 *  Allows the possibility to reset the internal Form.
     */
	resetForm: function(){
		this.formPanel.getForm().reset();
	},
	
    /** private: method[toggleControl]
     *  :arg element: ``Object``
	 * 
	 *  Defines the behavior of the tool's controls enablement when the Radio is checked. 
     */
	toggleControl: function (element) {
		// ////////////////////////////////////////////////
		// Remove the old features before switching OL 
		// selection control.
		// ////////////////////////////////////////////////
		this.spatialSelection.removeAllFeatures();
		
		for(key in this.drawControls) {
			var control = this.drawControls[key];
			if(element && element.value == key && element.checked) {
				control.activate();
			} else {
				control.deactivate();
			}
		}
	},
	
    /** private: method[addOutput]
     *  :arg config: ``Object``
	 * 
	 *  Contains the output definitions of the download FormPanel. 
     */
    addOutput: function(config) {
		// /////////////////////////////////////
		// Stores Array stores definitions.
		// /////////////////////////////////////
		this.layerStore = new Ext.data.ArrayStore({
			fields: ["source", "name", "wcs"],
			data: []
		});
			
		this.crsStore = new Ext.data.ArrayStore({
			fields: ["name"],
			data: this.targetCSR
		});
		
		this.formatStore = new Ext.data.ArrayStore({
			fields: ["format", "title", "name"],
			data: this.formats.wfs.concat(this.formats.wcs)
		});
		
		// /////////////////////////////////////
		// FieldSet definitions.
		// /////////////////////////////////////
		this.laySel = new Ext.form.FieldSet({
			title: "Data Selection",
			items: [
				{
					xtype: "combo",
					ref: "../layerCombo",
					fieldLabel: "Layer",
					width: 140,
					mode: 'local',
					triggerAction: 'all',
					store: this.layerStore,
					displayField: 'name',
					emptyText: this.initialText,
					editable: true,
					resizable: true,
					typeAhead: true,
					typeAheadDelay: 3,
					selectOnFocus:true,
					allowBlank: false,
					listeners:{
					    scope: this,
						beforeselect: function(combo, record, index){
							this.resetForm();
						},
						select: function(combo, record, index){									
						    // ////////////////////////////////////////
							// Remove the previous selected layer, 
							// from this tool if exists.
							// ////////////////////////////////////////
							if(this.selectedLayer){
								this.target.mapPanel.layers.remove(this.selectedLayer);
							}
							
							// ////////////////////////////
							// Add the new selected layer.
							// ////////////////////////////
							var layerName = record.data.name;
							var layerSource = record.data.source;
							var isWCS = record.data.wcs;
							
						    if(record){
								var options = {
									msLayerTitle: layerName,
									msLayerName: layerName,
									source: layerSource,
									customParams: {
										wcs: isWCS
									}
								};
								
								this.addLayerTool.addLayer(
									options
								);
							}
						}, 
						beforequery: function(){
							this.reloadLayers();
						}
					}
				},
				{
					xtype: "combo",
					ref: "../crsCombo",
					fieldLabel: "Target CRS",
					width: 140,
					mode: 'local',
					triggerAction: 'all',
					store: this.crsStore,
					displayField: 'name',
					valueField: 'name',
					emptyText: this.initialText,
					editable: true,
					resizable: true,
					typeAhead: true,
					typeAheadDelay: 3,
					allowBlank: false					
				},	
				{
					xtype: "combo",
					ref: "../formatCombo",
					fieldLabel: "Format",
					width: 140,
				    mode: 'local',
					triggerAction: 'all',
					store: this.formatStore,
					displayField: 'title',
					valueField: 'format',
					emptyText: this.initialText,
					resizable: true,
					allowBlank: false					
				}
			]
		});

		spatialSettings = new Ext.form.FieldSet({
			title: "Spatial Settings",
			items: [
				{
					xtype: 'radiogroup',
					ref: "../selectionMode",
					fieldLabel: 'Selection Mode',
					itemCls: 'x-check-group-alt',
					columns: 1,
					width: 140,
					allowBlank: false,
					items: [
						{boxLabel: 'Box', name: 'cb-col-1', value: 'box'},
						{boxLabel: 'Polygon', name: 'cb-col-1', value: 'polygon'},
						{boxLabel: 'Place', name: 'cb-col-1', value: 'place'}
					],
					listeners: {
						scope: this,
						change: function(group, checked){
							this.toggleControl(checked);
						}
					}
				},
				{
					xtype: "numberfield",
					ref: "../bufferField",
					fieldLabel: "Buffer (m)",
					width: 140,
					disabled: false					
				},
			    {
					xtype: 'radiogroup',
					ref: "../cutMode",
					fieldLabel: 'Cut Mode',
					itemCls: 'x-check-group-alt',
					columns: 1,
					items: [
						{boxLabel: 'Intersection', name: 'cb-col-2', checked: true},
						{boxLabel: 'Clip', name: 'cb-col-2'}
					]
				}
			]
		});
	
		// /////////////////////////////////////
		// FormPanel definition
		// /////////////////////////////////////
		var downloadForm = new Ext.form.FormPanel({
			title: "Download",
			labelWidth: 80,
            autoHeight: true,
			monitorValid: true,
			items:[
				this.laySel,
				spatialSettings
			],
			buttons:[
				'->',
				{
					text: "Reset",
					scope: this,
					handler: function(){
						// ////////////////////////////////////////
						// Remove the previous selected layer, 
						// from this tool if exists.
						// ////////////////////////////////////////
						if(this.selectedLayer){
							this.target.mapPanel.layers.remove(this.selectedLayer);
						}
						
						// ///////////////////
						// Reset From fields.
						// ///////////////////
						this.resetForm();
					}
				},
				{
					text: "Download",
					type: 'submit',	
					handler: function(){
						var layerCombo = downloadForm.layerCombo.isValid();
						var crsCombo = downloadForm.crsCombo.isValid();
						var formatCombo = downloadForm.formatCombo.isValid();
						var selectionMode = downloadForm.selectionMode.isValid();
						var bufferField = downloadForm.bufferField.isValid();
						var cutMode = downloadForm.cutMode.isValid();
						
						var isValid = layerCombo && crsCombo && formatCombo && 
							selectionMode && bufferCombo && cutMode;
						if(isValid){
							alert(isValid);
						}
					}
				}
			]
		});
		
		this.formPanel = downloadForm;
        
		var panel = gxp.plugins.DownloadPanel.superclass.addOutput.call(this, downloadForm);		
		return panel;
    }   
});

Ext.preg(gxp.plugins.DownloadPanel.prototype.ptype, gxp.plugins.DownloadPanel);
