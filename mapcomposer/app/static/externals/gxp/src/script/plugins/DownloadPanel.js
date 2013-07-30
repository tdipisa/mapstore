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
    
    /** api: config[geostoreUrl]
     *  ``String``
     */
    geostoreUrl: null,
    
    /** api: config[geostoreUser]
     *  ``String``
     */
    geostoreUser: null,

    /** api: config[geostorePassword]
     *  ``String``
     */
    geostorePassword: null,

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

    /** api: config[resultPanel]
     *  ``Object``
     */
    resultPanel: null,

    /** 
     *  ``gxp.plugins.wpsClusterManager``
     */
    wpsClusterManager: null,

    /** 
     *  ``gxp.plugins.FeatureManager``
     */
    featureManager: null,
    
    /** api: config[gazetteerConfig]
     *  ``Object``
     */
    gazetteerConfig: null,

    /** api: config[bufferRequestTimeout]
     *  ``Integer``
     */
    bufferRequestTimeout: 1 * 1000,
    
	/** api: config[wfsDefaultVersion]
     *  ``String``
     */
    wfsDefaultVersion: '1.0.0',
    
	/** api: config[wcsDefaultVersion]
     *  ``String``
     */
    wcsDefaultVersion: '1.0.0',
    
	/** api: config[wpsDefaultVersion]
     *  ``String``
     */
    wpsDefaultVersion: '1.0.0',

	/** api: config[ogcFilterVersion]
     *  ``String``
     */
    ogcFilterVersion: '1.1.0',
    
    tabTitle: "Download",
    
    dselTitle: "Data Selection",
    dselLayer: "Layer",
    dselCRS: "Target CRS",
    dselFormat: "Format",
    
    settingTitle: "Spatial Settings",
    settingSel: "Selection Mode",
    settingCut: "Cut Mode",
    
    emailNotificationTitle: "Email notification",
    emailFieldLabel: "Email",

    vectorFilterTitle: "Vector Filter",
    
    placeSearchLabel: "Place",

    resTitle: "Results",
    resID: "ID",
    resExecID: "execID",
    resProcStatus: "Process Status",
    resGet: "Get",
    resDelete: "Delete",
    resPhase: "Phase",
    resProgress: "Progress",
    resResult: "Result",
    
    btnRefreshTxt: "Refresh",
    btnResetTxt: "Reset",
    btnDownloadTxt: "Download",
    
    errMissParamsTitle: "Missing parameters" ,
    errMissParamsMsg: "Please fill all the mandatory fields" ,
    
    errMissGeomTitle: "Missing feature" ,
    errMissGeomMsg: "Please draw the Area of Interest before submitting" ,

    msgRemRunningTitle:"Remove Running Instance",
    msgRemRunningMsg:  "You are about to delete a running instance, you will not be able to retreave the result<br/>Do you really want to delete instance ?",
    msgRemTitle: "Remove Instance",
    msgRemMsg: "Do you want to delete instance ?",
    msgRemDone: "Instance removed.",
    
    errWPSTitle: "DownloadProcess not supported",
    errWPSMsg: "This WPS server does not support gs:Download process",
	wpsErrorMsg: "The WPS reports the following error",
    
    errBufferTitle: "Buffer failed",
    errBufferMsg: "Error buffering feature",
    
    errUnknownLayerTypeTitle: "Unknown layer type",
    errUnknownLayerTypeMsg: "Cannot estabilish the type of the selected layer. Please select another layer to download",
    
    msgEmptyEmailTitle: "Empty email",
    msgEmptyEmailMsg: "The email notification is enabled, but the email field is not filled. Continue wihout email notification?",
    
    msgEmptyFilterTitle: "Empty filter",
    msgEmptyFilterMsg: "The filter is enabled, but the filter is not filled. Continue wihout filter?",
    
    msgTooltipPending: 'Pending',
    msgTooltipSuccess: 'Success',
    msgTooltipExecuting: 'Executing',
    msgTooltipFailed: 'Failed',
    msgTooltipAccepted: 'Accepted',
    
    msgGeostoreException: "Geostore Exception",
    
    msgBox: 'Box',
    msgPolygon: 'Polygon',
    msgCircle: 'Circle',
    msgPlace: 'Place',
    
    msgIntersection: 'Intersection',
    msgClip: 'Clip',
    
    msgInstance: 'Instance',
    
    msgName: 'Name',
    msgCreation: 'Creation',
    msgDescription: 'Description',       
    msgCategory: 'Category',          
    msgMetadata: 'Metadata',
    msgAttributes: 'Attributes',
    
    errUnexistingListMsg: "Lista non esistente",
    
    
    
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
							this.formPanel.cutMode.disable();
						}else{
							this.formatStore.loadData(this.formats.wfs, false);
                            this.formPanel.cutMode.enable();
                            this.showMask();
                            this.featureManager.setLayer(layerRecord);
						}
					},
					scope: this
				});
				
				var map = this.target.mapPanel.map;
				
				// ///////////////////////////////////
				// Add Plugin controls Tools
				// ///////////////////////////////////
				this.spatialSelection = new OpenLayers.Layer.Vector("Spatial Selection",{
					displayInLayerSwitcher: false,
				});
				
                this.spatialSelection.events.register("beforefeatureadded", this, function(){
					// //////////////////////////////////////////////////////
					// Remove the old features before drawing other features.
					// //////////////////////////////////////////////////////
					this.spatialSelection.removeAllFeatures();
                    
					// //////////////////////////////////////////////////////
					// reset the buffer field when the geometry has changed
                    // the preventBufferReset is needed to avoid resetting it when the buffered feature is added
					// //////////////////////////////////////////////////////
                    if(!this.spatialSelection._preventBufferReset) {
                        this.formPanel.bufferField.reset();
                        this.spatialSelection.removeAllFeatures();
                    }
				});
                this.spatialSelection.events.register("featureadded", this, function(){
					// //////////////////////////////////////////////////////
					// Check the form status: the buffer field shall be enabled here
					// //////////////////////////////////////////////////////
					this.updateFormStatus();
				});
                this.spatialSelection.events.register('featureremoved', this, function() {
					// //////////////////////////////////////////////////////
					// Remove the "unbuffered" copy of the feature
					// //////////////////////////////////////////////////////
                    delete this.unBufferedFeature;
					// //////////////////////////////////////////////////////
					// Check the form status: the buffer field shall be disabled here
					// //////////////////////////////////////////////////////
                    this.updateFormStatus();
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
					circle: new OpenLayers.Control.DrawFeature(this.spatialSelection,
						OpenLayers.Handler.RegularPolygon, {handlerOptions: {sides: 30}}),
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
				
				if (!this.wpsClusterManager){
				    this.wpsClusterManager = new gxp.plugins.WPSClusterManager({
                        id: "DownloadPanelwpsClusterManager",
                        url: this.wpsUrl,
                        proxy: this.target.proxy,//this.wpsProxy,
                        geoStoreClient: new gxp.plugins.GeoStoreClient({
                            url: this.geostoreUrl,
                            user: this.geostoreUser,
                            password: this.geostorePassword,
                            proxy: this.target.proxy,//this.geostoreProxy,
                            listeners: {
                                "geostorefailure": function(tool, msg){
                                    Ext.Msg.show({
                                        title: this.msgGeostoreException,
                                        msg: msg,
                                        buttons: Ext.Msg.OK,
                                        icon: Ext.Msg.ERROR
                                    });
                                },
                                scope: this
                            }
                        })
                    });
				}
                
                this.featureManager = this.target.tools[this.featureManager];
                this.featureManager.on({
                    scope: this,
                    layerchange: function(fm, record, schema) {
                        this.createVectorFilterForm(schema);
                        this.hideMask();
                    }
                });
			},
			scope: this
		});
        
		return gxp.plugins.DownloadPanel.superclass.init.apply(this, arguments);
    },

	/**
	* api: method[buildLayerWPSUrl]
	*
	* This method to use the specific layer's URL for WPS requests
	*/
	buildLayerWPSUrl: function(url){
		var newURL = url.replace(/\/wms/g, "/ows");
		newURL = newURL.concat("?service=WPS");
		
		this.wpsClusterManager.setWPSClient(newURL);
		
		return newURL;
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
		this.toggleControl();
		this.formPanel.getForm().reset();
	},
	
    /** private: method[toggleControl]
     *  :arg element: ``Object``
	 * 
	 *  Defines the behavior of the tool's controls enablement when the Radio is checked. 
     */
	toggleControl: function (value) {
		// ////////////////////////////////////////////////
		// Remove the old features before switching OL 
		// selection control.
		// ////////////////////////////////////////////////
		this.spatialSelection.removeAllFeatures();
        this.formPanel.bufferField.reset();

        if(value == 'place') {
            this.formPanel.placeSearch.show();
        } else {
            this.formPanel.placeSearch.hide();
        }
        for(key in this.drawControls) {
            var control = this.drawControls[key];
            if(value == key) {
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
			title: this.dselTitle,
			items: [
				{
					xtype: "combo",
					ref: "../layerCombo",
					fieldLabel: this.dselLayer,
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
						    this.toggleControl();
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
							
							var layerSource = this.target.layerSources[record.data.source];
							var url = this.buildLayerWPSUrl(layerSource.url);
                            url += "&version=" + this.wpsDefaultVersion+"&request=DescribeProcess&identifier=gs:Download";
							
                            var requestUrl = this.isSameOrigin(url) ? url : this.target.proxy + encodeURIComponent(url);
                            var Request = Ext.Ajax.request({
                                url: requestUrl,
                                method: 'GET',
                                scope: this,
                                success: function(response, opts){
                                    if(response.responseXML){
                                        var xml= response.responseXML;
                                        if(xml.getElementsByTagName("ProcessDescription").length == 0){
                                            Ext.Msg.show({
                                                title: this.errWPSTitle,
                                                msg: this.errWPSMsg,
                                                buttons: Ext.Msg.OK,
                                                icon: Ext.MessageBox.ERROR
                                            });
                                            this.formPanel.downloadButton.disable();
                                        }else
                                        {
                                            this.formPanel.downloadButton.enable();
                                        }
                                    }else{
                                        Ext.Msg.show({
                                            title: 'Cannot read response',
                                            msg: response.statusText + "(status " + response.status + "):  " + response.responseText,
                                            buttons: Ext.Msg.OK,
                                            icon: Ext.MessageBox.ERROR
                                        });   
                                    }
                                },
                                failure: function(response, opts){
                                    console.error(response);
                                }
                            });     
        
							// ////////////////////////////
							// Add the new selected layer.
							// ////////////////////////////
							var layerName = record.data.name;
							var layerSource = record.data.source;
							//var isWCS = record.data.wcs;
							
                            // check the layer type
                            // async because it may need to check for describeFeatureType and describeCoverage
                            this.getLayerType(record.data, function(layerType) {
                                if(!layerType) {
                                    this.formPanel.downloadButton.disable();
                                    this.formPanel.resetButton.disable();
                                    this.formPanel.refreshButton.disable();
                                    return Ext.Msg.show({
                                        title: this.errUnknownLayerTypeTitle,
                                        msg: this.errUnknownLayerTypeMsg,
                                        buttons: Ext.Msg.OK,
                                        icon: Ext.Msg.INFO
                                    });
                                }
                                
                                record.data.wcs = (layerType == 'WCS');
                                
								var options = {
									msLayerTitle: layerName,
									msLayerName: layerName,
									source: layerSource,
									customParams: {
										wcs: (layerType == 'WCS')
									}
								};
								
								this.addLayerTool.addLayer(
									options
								);
                                
                                this.updateFormStatus();
                                
                                this.formPanel.downloadButton.enable();
                                this.formPanel.resetButton.enable();
                                this.formPanel.refreshButton.enable();
                            }, this);
						}, 
						beforequery: function(){
							this.reloadLayers();
						}
					}
				},
				{
					xtype: "combo",
					ref: "../crsCombo",
					fieldLabel: this.dselCRS,
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
					allowBlank: false,
                    listeners: {
                        scope: this,
                        select: function() {
                            this.spatialSettings.items.each(function(field) {
                                field.reset();
                            });
                            this.toggleControl(); //this.spatialSelection.removeAllFeatures();
                            this.updateFormStatus();
                        }
                    }
				},	
				{
					xtype: "combo",
					ref: "../formatCombo",
					fieldLabel: this.dselFormat,
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
        
        this.placeSearch = new gxp.GazetteerCombobox(Ext.apply(this.gazetteerConfig, {
            xtype: 'gazetteercombobox',
            fieldLabel: this.placeSearchLabel,
            hidden: true,
            disabled: true,
			width: 140,
            ref: "../placeSearch",
            listeners: {
                scope: this,
                'select': function(store, record) {
                    var feature = record.data.feature;
                    var bounds = feature.geometry.getBounds();
                    
                    this.spatialSelection.addFeatures([feature]);
                    
                    //if the geometry is point, force the user to insert a buffer
                    if(feature.geometry.CLASS_NAME == 'OpenLayers.Geometry.Point') {
                        var buffered = OpenLayers.Geometry.Polygon.createRegularPolygon(feature.geometry, 1000, 4);
                        bounds = buffered.getBounds();
                        this.formPanel.bufferField.allowBlank = false;
                    } else {
                        this.formPanel.bufferField.allowBlank = true;
                    }

                    this.target.mapPanel.map.zoomToExtent(bounds);
                }
            }
        }));

		this.spatialSettings = new Ext.form.FieldSet({
			title: this.settingTitle,
			items: [
				{
					xtype: 'combo',
					ref: "../selectionMode",
					fieldLabel: this.settingSel,
                    disabled: true,
					//itemCls: 'x-check-group-alt',
					//columns: 1,
					width: 140,
					allowBlank: false,
                    valueField: 'value',
                    displayField: 'text',
                    triggerAction: 'all',
                    mode: 'local',
                    store: new Ext.data.ArrayStore({
                        fields: ['value', 'text'],
                        data: [
                            ['box', this.msgBox], ['polygon', this.msgPolygon], ['circle', this.msgCircle], ['place', this.msgPlace]
                        ]
                    }),
					listeners: {
						scope: this,
						select: function(combo){
							this.toggleControl(combo.getValue());
                            this.updateFormStatus();
						}
					}
				},
                this.placeSearch,
				{
					xtype: "numberfield",
					ref: "../bufferField",
					fieldLabel: "Buffer (m)",
					width: 140,
                    enableKeyEvents: true,
                    disabled: true,
                    listeners: {
                        scope: this,
                        keyup: function(field) {
                            var me = this,
                                value = field.getValue();

                            // whatever value, clear the timeouts
                            if(me.bufferHideLoadMaskTimeout) clearTimeout(me.bufferHideLoadMaskTimeout);
                            if(me.bufferTimeout) clearTimeout(me.bufferTimeout);
                                
                            if(!value) {
                                //if value is empty and we have an unBufferedFeature stored, replace the buffered feature with the un-buffered one. The user deleted the buffer value, so he wants the original geometry back
                                if(me.unBufferedFeature) {
                                    this.spatialSelection.addFeatures([me.unBufferedFeature]);
                                }
                            } else {
                                //set a timeout to hide the loadmask if the buffer request fails
                                me.bufferHideLoadMaskTimeout = setTimeout(function() {
                                    
                                    me.loadMask.hide();
                                }, 30 * 1000);

                                me.bufferTimeout = setTimeout(function() {
                                    me.bufferSpatialSelection(value);
                                }, me.bufferRequestTimeout);
                            }
                        }
                    }
				},
                {
                    xtype: 'combo',
					ref: "../cutMode",
                    disabled: true,
					fieldLabel: this.settingCut,
                    valueField: 'value',
                    displayField: 'text',
                    triggerAction: 'all',
                    mode: 'local',
                    value: false,
                    width: 140,
                    store: new Ext.data.ArrayStore({
                        fields: ['value', 'text'],
                        data: [
                            [false, this.msgIntersection], [true, this.msgClip]
                        ]
                    })
                }
				/*{
					xtype: 'radiogroup',
					ref: "../cutMode",
                    disabled: true,
					fieldLabel: this.settingCut,
					itemCls: 'x-check-group-alt',
					columns: 1,
					items: [
						{boxLabel: 'Intersection', name: 'cb-col-2', inputValue: false, checked: true},
						{boxLabel: 'Clip', name: 'cb-col-2', inputValue: true}
					]
				} */
			]
		});
        
        this.vectorFilterContainer = new Ext.form.FieldSet({
            title: this.vectorFilterTitle,
            checkboxToggle: true,
            collapsed: true,
            hidden: true
        });

        this.emailNotification = new Ext.form.FieldSet({
            title: this.emailNotificationTitle,
            checkboxToggle: true,
            collapsed: true,
            ref: "emailNotification",
            items: [
                /*{ // TODO Disabled due to unimplemented plug-in
                    xtype: "textfield",
                    ref: "../filterField",
                    fieldLabel: this.optFilter,
                    width: 140,
                    disabled: false                 
                },*/
                {
                    xtype: "textfield",
                    vtype: "email",
                    allowBlank: false,
                    ref: "../emailField",
                    fieldLabel: this.emailFieldLabel,
                    width: 140
                }
            ]
        });


        // set the cookie
        /*
        Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime()+(1000*60*60*24*7)) //7 days from now
        }));
        
        // TODO: The developer must provide an implementation which returns an object hash which represents the Component's restorable state.
        */
        // create the data store
        var store = new Ext.data.ArrayStore({
            fields: [
               {name: 'id'},
			   {name: 'name'},
               {name: 'executionId'},
               {name: 'executionStatus'},
               {name: 'phase'},
               {name: 'progress'},
               {name: 'result'}
            ]
        });
        
        var mydlp = this;
        this.resultPanel = new Ext.grid.GridPanel({
            layout:'fit',
            store: store,
            columns: [
                {
                    id       : 'id',
                    header   : this.resID, 
                    width    : 30, 
                    hidden : true, 
                    dataIndex: 'id'
                },
				{
                    id       : 'name',
                    header   : "Name", 
                    width    : 30, 
                    hidden : true, 
                    dataIndex: 'name'
                },
                {
                    id       : 'executionId',
                    header   : this.resExecID, 
                    width    : 45, 
                    sortable : true, 
                    dataIndex: 'executionId'
                },
                {
                    id       : 'executionStatus',
                    header   : this.resProcStatus, 
                    width    : 63, 
                    dataIndex: 'executionStatus',
					renderer:  function (val, obj, record) {
						if(!val)
							return;
						if(val!='Failed' && record.data.phase){
							return Ext.util.Format.capitalize(record.data.phase);
						}
						return val;
					}
                },
                {
                    xtype: 'actioncolumn',
                    header: this.resGet, 
                    width: 36,
                    items: [{
                            getClass: function(v, meta, rec) {
                                var tooltip = '', icnClass='decline';
								var execStatus = rec.get('executionStatus'); 
                                switch (execStatus) {    
                                    case 'Process Pending':
                                    case 'Pending':
                                        icnClass = 'decline';
                                        tooltip = mydlp.msgTooltipPending;
                                        break;
									case 'Process Running':
                                    case 'Running':
                                        if(rec.get('phase')=='COMPLETED'){
                                            icnClass = 'accept';
                                            tooltip = 'Success';
                                        }else if(rec.get('phase')=='FAILED'){
                                            icnClass = 'decline';
                                            tooltip = 'Failed';
                                        }else{
                                            icnClass = 'loading';
                                            tooltip = 'Accepted';
                                        }
                                        break;
                                    case 'Process Succeeded':
                                    case 'Succeeded':
                                        icnClass = 'accept';
                                        tooltip = mydlp.msgTooltipSuccess;
                                        break;
                                    case 'Process Started':
                                    case 'Started':
                                        icnClass = 'accept';
                                        tooltip = mydlp.msgTooltipExecuting;
                                        break;
                                    case 'Process Accepted':
                                    case 'Accepted':
                                        if(rec.get('phase')=='COMPLETED'){
                                            icnClass = 'accept';
                                            tooltip = mydlp.msgTooltipSuccess;
                                        }else if(rec.get('phase')=='FAILED'){
                                            icnClass = 'decline';
                                            tooltip = mydlp.msgTooltipFailed;
                                        }else{
                                            icnClass = 'loading';
                                            tooltip = mydlp.msgTooltipAccepted;
                                        }
                                        break;
                                    default:
                                        icnClass = 'decline';
                                        tooltip = execStatus;
                                        break;
                                }
                                this.items[0].tooltip = tooltip;
                                return icnClass;
                            },
                            handler: function(grid, rowIndex, colIndex) {
                                var rec = store.getAt(rowIndex);
								var execStatus = rec.get('executionStatus'); 
                                if(execStatus.indexOf('Succeeded')!= -1){
                                    mydlp.getInstance(rec.get('id'));
                                }
                            }
                    }]
                },
                {
                    xtype: 'actioncolumn',
                    header: this.resDelete, 
                    width: 57,
                    hidden: false,
                    items: [{
                        iconCls: 'reset',
                        tooltip: this.resDelete,
                        handler: this.deleteHandler
                        ,scope: this
                    }]
                    ,scope:this
                },{
                    id       : 'phase',
                    header   : this.resPhase, 
                    width    : 60, 
                    sortable : true, 
                    hidden   : true,
                    dataIndex: 'phase'
                },
                {
                    id       : 'progress',
                    header   : this.resProgress, 
                    width    : 79, 
                    sortable : true, 
                    dataIndex: 'progress'
                },/*
                {
                    id       : 'result',
                    header   : 'RESULT', 
                    width    : 50, 
                    sortable : true, 
                    dataIndex: 'result'
                },*/{
                    //xtype: 'actioncolumn',
                    header: this.resResult, 
                    width: 53,
                    dataIndex: 'result',
                    /*items: [{
						getClass: function(v, meta, rec) { 
							var tooltip = '', icnClass='';
							console.log(rec.get('result'));
							if(rec.get('result')!= '') {    
									icnClass = 'download';
									tooltip = 'Download result';
							}
							this.items[0].tooltip = tooltip;
							return icnClass;
						},
						handler: function(grid, rowIndex, colIndex) {
							var rec = store.getAt(rowIndex);
							console.log(rec.get('result'));
						}
                    }],*/
                    renderer:function (val, obj, record) {
						if(!val){
							return;
						}else{		
							//
							// Regular expression to check if we have a valid URL
							//
							var regex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;							
							if(regex.test(val)){
								return '<a href="' + val + '" target="_blank" /><img src="theme/app/img/download.png" /></a>';
							}else{
							    var message = mydlp.wpsErrorMsg;
							    var html = '<img src="theme/app/img/download.png" onclick="Ext.Msg.show({title: \'Failed\', msg: \'' + message + ' -  ' + val + '\', buttons: Ext.Msg.OK, icon: Ext.Msg.ERROR});"/>'; 								
								return html;
							}
						}
					}
                },
            ],
            //stripeRows: true,
            //autoExpandColumn: 'description',
            height: 205,
            //width: 600,
            title: this.resTitle,
            /*
            // config options for stateful behavior, cookie
            stateful: true,
            stateId: 'resultsState',
            */
            listeners:{
                viewready:{
                    fn: function(){
						this.getInstances(true);
						//this.startRunner();
					},
                    scope: this
                }
            },
            scope:this
        });
        
		// /////////////////////////////////////
		// FormPanel definition
		// /////////////////////////////////////
		var downloadForm = new Ext.form.FormPanel({
			title: this.tabTitle,
			region: 'center',
			labelWidth: 80,
			monitorValid: true,
			items:[
				this.laySel,
				this.spatialSettings,
				this.emailNotification,
                this.vectorFilterContainer,
				this.resultPanel
			],
			buttons:[
				'->',
				{
					text: this.btnRefreshTxt,
                    ref: '../refreshButton',
                    cls: 'x-btn-text-icon',
                    icon :'theme/app/img/silk/arrow_refresh.png',
					scope: this,
					handler: function(){                           
                        // reset pending
                        this.pendingRows = 0;
        
                        store.each(this.updateRecord, this);
        
                        // Stop if nothing left pending
                        if(this.pendingRows <= 0){
                            return false;
                        }
                    }
				},
                {
                    text: this.btnResetTxt,
                    ref: '../resetButton',
                    cls: 'x-btn-text-icon',
                    icon :'theme/app/img/silk/application_form_delete.png',
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
					text: this.btnDownloadTxt,
					type: 'submit',
					ref: '../downloadButton',
					cls: 'x-btn-text-icon',
					icon :'theme/app/img/download.png',
					handler: function(){
					    var layerCombo = downloadForm.layerCombo.isValid();
						var crsCombo = downloadForm.crsCombo.isValid();
						var formatCombo = downloadForm.formatCombo.isValid();
						var selectionMode = downloadForm.selectionMode.isValid();
						var bufferField = downloadForm.bufferField.isValid();
						var cutMode = downloadForm.cutMode.isValid();									
						var isValid = layerCombo && crsCombo && formatCombo && 
							selectionMode  && cutMode && bufferField;
						
						if(!isValid){
						    Ext.Msg.show({
                                title: this.errMissParamsTitle,
                                msg: this.errMissParamsMsg,
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.INFO
                            });
                            return;
						}
                        
                        var requestFunction = function() {
							var asreq = this.getAsyncRequest(downloadForm);
    						this.wpsClusterManager.execute('gs:Download', asreq, this.executeCallback, this);
                        };
                        
                        //check the email notification field
                        // if it's checked but invalid, ask the user to confirm the operation without email notification
                        if(downloadForm.emailNotification.checkbox.getAttribute('checked')) {
                            if(!downloadForm.emailField.isValid()) {
                                return Ext.Msg.show({
                                    title: this.msgEmptyEmailTitle,
                                    msg: this.msgEmptyEmailMsg,
                                    buttons: Ext.Msg.YESNOCANCEL,
                                    fn: function(btnValue) {
                                        if(btnValue == 'yes') {
                                            requestFunction.call(this);
                                        }
                                        return;
                                    },
                                    scope: this,
                                    animEl: 'elId',
                                    icon: Ext.MessageBox.QUESTION
                                });
                            }
                        }
                        
                        // check the filter field
                        // if it's checked but invalid, ask the user to confirm the operation without the filter
                        if(this.vectorFilterContainer.checkbox.getAttribute('checked')) {
                            if(!downloadForm.filterBuilder.getFilter()) {
                                return Ext.Msg.show({
                                    title: this.msgEmptyFilterTitle,
                                    msg: this.msgEmptyFilterMsg,
                                    buttons: Ext.Msg.YESNOCANCEL,
                                    fn: function(btnValue) {
                                        if(btnValue == 'yes') {
                                            requestFunction.call(this);
                                        }
                                        return;
                                    },
                                    scope: this,
                                    animEl: 'elId',
                                    icon: Ext.MessageBox.QUESTION
                                });
                            }
                        }
                        
						if(this.spatialSelection.features.length){
                            requestFunction.call(this);
						}else{
                            Ext.Msg.show({
                                title: this.errMissGeomTitle ,
                                msg: this.errMissGeomMsg,
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.INFO
                            });
                            return;						
						}
					},
					scope:this
				}
			]
		});
		
		this.formPanel = downloadForm;
        
		var panel = gxp.plugins.DownloadPanel.superclass.addOutput.call(this, downloadForm);		
		panel.autoScroll = true;
		return panel;
    },
    
    /**
     * private 
     */        
    executeCallback: function(instanceOrRawData){
        var task = new Ext.util.DelayedTask(this.getInstances, this, [false]);
        task.delay(1000);
		
		var task2 = new Ext.util.DelayedTask(this.startRunner, this, [false]);
        task2.delay(1500);
		
        //setTimeout("getInstances(false)", 1000);
    },
    
    getAsyncRequest: function(dform){
    
        // default true
        var crop = "false";
        var cropSel = dform.cutMode.getValue();
        
        if(cropSel)
            crop = cropSel;//.inputValue === true ? "true" : "false";
        
        var layer = dform.layerCombo.getValue();
        var crs = dform.crsCombo.getValue();
        var format = dform.formatCombo.getValue();
        
        var wkt ;
        if(this.spatialSelection.features.length > 0){
            
            var formatwkt = new OpenLayers.Format.WKT();
            var feature = this.spatialSelection.features[0];
            
            var choosenProj = new OpenLayers.Projection(crs);
            var mapProj = this.target.mapPanel.map.getProjectionObject();
            
            var clone = feature.geometry.clone();
            
            clone = clone.transform(mapProj, choosenProj);
                       
            var tf = new OpenLayers.Feature.Vector(clone);
            wkt = formatwkt.write(tf);
            
            //console.log(wkt);
        }

        var request = {
            storeExecuteResponse: true,
            lineage:  true,
            status: true,
            inputs:{
                layerName : new OpenLayers.WPSProcess.LiteralData({value:layer}),
                //"application/gml-3.1.1" "application/zip"
                outputFormat:new OpenLayers.WPSProcess.LiteralData({value:format}),
                targetCRS:new OpenLayers.WPSProcess.LiteralData({value:crs}),
                ROI: new OpenLayers.WPSProcess.ComplexData({
                    //value: "MULTIPOLYGON (((593183.6607205212 4923980.52355841, 593157.5354776975 4925010.357654894, 593538.9831172063 4925012.3979659295, 593486.3194805589 4924758.104346828, 593396.420353626 4924644.995457535, 593390.2700977508 4924528.182140326, 593279.007632818 4924326.4864263795, 593256.9034614969 4924278.360480662, 593221.8366082398 4924192.04550526, 593198.169007116 4924063.757134442, 593194.3458770494 4924031.687860058, 593183.6607205212 4923980.52355841)))",
                    value: wkt,
                    mimeType: "application/wkt"
                }),
                cropToROI: new OpenLayers.WPSProcess.LiteralData({value:crop})
            },
            outputs: [{
                identifier: "result",
                mimeType: "application/zip"
            }]
        };

        var filter = dform.filterBuilder.getFilter();
        var email = dform.emailField.getValue();
        
        if(filter && this.vectorFilterContainer.checkbox.getAttribute('checked')) {
            //var filterFormat = new OpenLayers.Format.Filter({version: this.ogcFilterVersion});
            //var xmlFormat = new OpenLayers.Format.XML();
            //var filterValue = xmlFormat.write(filterFormat.write(filter));
            var format = new OpenLayers.Format.CQL();
            var filterValue = format.write(filter);
            request.inputs['filter'] = new OpenLayers.WPSProcess.LiteralData({value: filterValue});
        }

        if(dform.emailField.isValid() && email != ''){
            request.inputs['email'] = new OpenLayers.WPSProcess.LiteralData({value:email});
        }
        
        return request;
    },    
    
    getInstances: function(update){        
        // TODO getExecuteInstances deve essere slegato da geostore
        var me = this;
        this.wpsClusterManager.getExecuteInstances("gs:Download", update, function(instances){
            var store = me.resultPanel.getStore();
            store.removeAll();
            var dsc, p;
            for(var i=0; i<instances.length; i++){
                //console.log(instances[i]);
                var data = {
                    id: '',
					name: '',
                    executionId: '',
                    executionStatus: '',
                    description: '',
                    //description: '',
                    //description: '',
					progress: '',
					result: '',
                    status:''
                };
                data.id = instances[i].id;
                data.name = instances[i].name;
				
                dsc = Ext.decode(instances[i].description);
				
				data.progress = dsc.progress;
				data.result = dsc.result;
				
                //console.log(dsc);
                switch(dsc.status){
                    case 'Process Started':
                    case 'Process Accepted':
                    case 'Process Paused':
                    case 'Process Failed':
                    case 'Process Succeeded':
                        data.executionStatus = dsc.status.replace('Process ', '');
                        break;
                    default:
                        data.executionStatus = dsc.status;
                        break;
                }
				
				data.executionId = dsc.executionId;
                /*if(dsc.statusLocation){
                    data.description = dsc.statusLocation;
                    var getParams = dsc.statusLocation.split("?");
                    if(getParams.length>1){
                        var params = Ext.urlDecode(getParams[1]);
                        if(params.executionId){
                            data.executionId = params.executionId;
                        }
                    }
                }*/
				
                //console.log(data);
                p = new store.recordType(data); // create new record
                store.add(p);
            }
			
            me.resultPanel.getView().refresh();
            //me.startRunner();
        });
         
    },
    deleteHandler: function(grid, rowIndex, colIndex) {
            var rec = grid.getStore().getAt(rowIndex);
            var id = rec.get('id');
            
            if(rec.get('executionStatus') == 'Accepted'){
                
                Ext.Msg.show({
                   title: this.msgRemRunningTitle,
                   msg: this.msgRemRunningMsg,
                   buttons: Ext.Msg.OKCANCEL,
                   fn: function(btn){
                        if(btn == 'ok') 
                            this.removeInstance(id);
                    },
                   icon: Ext.MessageBox.WARNING,
                   scope: this
                });
                
            }else{
                
                Ext.Msg.show({
                   title: this.msgRemTitle,
                   msg: this.msgRemMsg,
                   buttons: Ext.Msg.OKCANCEL,
                   fn: function(btn){
                        if(btn == 'ok') 
                            this.removeInstance(id);
                    },
                   icon: Ext.MessageBox.QUESTION,
                   scope: this
                });
            }
            return false;
    },
                    
    removeInstance: function(instanceID){
        var me = this;
        
        me.wpsClusterManager.deleteExecuteInstance(instanceID, function() {
            me.getInstances(false);
        });
    },
    
    getInstance: function(instanceID){
        
        this.wpsClusterManager.getExecuteInstance(instanceID, false, function(instance){
           
            var tpl = new Ext.XTemplate(
                '<table class="gridtable">',
                '<tr><th>ID</th>',
                '<td>{id}</td></tr>',
                '<tr><th>'+this.msgName+'</th>',
                '<td>{name}</td></tr>',
                '<tr><th>'+this.msgCreation+'</th>',
                '<td>{creation}</td></tr>',
                '<tr><th>'+this.msgDescription+'</th>',       
                '<td>{description}</td></tr>',
                '<tr><th>'+this.msgCategory+'</th>',          
                '<td>{category}</td></tr>',
                /*'<tr><th>'+this.msgMetadata+'</th>',          
                '<td>{metadata}</td></tr>',
                '<tr><th>'+this.msgAttributes+'</th>',        
                '<td>{attributes}</td></tr>',
                '<td>{store}</td></tr>',*/
                '</table>'
                );
          
            instance.Resource.store = Ext.encode(instance.Resource.data);
            instance.Resource.category = Ext.encode(instance.Resource.category);
            Ext.Msg.show({
                title: this.msgInstance + " " + instance.Resource.id,
                msg: tpl.applyTemplate(instance.Resource),
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
            });
            
       });
    },
    
    startRunner: function(){
        
        var store = this.resultPanel.getStore();
        
        //if(!this.runningTask)
            this.runningTask = Ext.TaskMgr.start({
                run: function(){
                    
                    // reset pending
                    this.pendingRows = 0;
    
                    store.each(this.updateRecord, this);
    
                    // Stop if nothing left pending
                    if(this.pendingRows <= 0){
                        return false;
                    }
                },
                interval: 10000,
                scope: this
            });
       // else
       //     Ext.TaskMgr.start(this.runningTask);
        
        
    },
    stopRunner: function(){
        
        //Ext.TaskMgr.stopAll();
        if(this.runningTask)
            Ext.TaskMgr.stop(this.runningTask);
        
    },
    
    pendingRows: 0,
    
    updateRecord: function(r){        
		var phase = r.get('phase');
		var execId = r.get('executionId');
		var execStatus = r.get('executionStatus');
        
        if(!execId){
            return;
        }
        
        // TODO: i nomi dei campi delle due richieste wps non coincidono, workaround temporaneo
		
        if(execStatus == 'Failed' || execStatus == 'Succeeded'){
            return;
        }
        
        /*if(phase && phase != 'RUNNING'){
            return;
        }*/
        
        r.beginEdit();
        
        var request = {
            type: "raw",
            inputs:{
                executionId : new OpenLayers.WPSProcess.LiteralData({value:r.get('executionId')}),
            },
            outputs: [{
                identifier: "result",
                mimeType: "application/json"
            }]
        };

        this.wpsClusterManager.execute('gs:ClusterManager', request, function(response){
            var element =  Ext.decode(response);
            
            if(!("list" in element)){
                alert(this.errUnexistingListMsg);
                return;
            }
            
            var list = element.list;
            var magicString = 'org.geoserver.wps.executor.ProcessStorage_-ExecutionStatusEx';
            
            if(!(magicString in list)){
                /* // DEBUG
                alert("Lista vuota");
                for (var i in list){
                    console.log(i);
                    console.log(list[i]);
                }
                */
                return;
            }
            
            var x = list[magicString];
            if( x && (x.length > 0) ){
                r.set('phase', x[0].phase);
                r.set('progress', x[0].progress);
                r.set('result', x[0].result);
            } 
			
			/*var status;
			var exStatus = execStatus;
			var phase = x[0].phase;
			switch(phase){
				case 'ACCEPTED': status = 'Process Accepted'; break;
				case 'STARTED': status = 'Process Started'; break;
				case 'COMPLETED': status = 'Process Succeeded'; break;
				case 'RUNNING': status = 'Process Running'; break;
				case 'FAILED': status = 'Process Failed'; break;
				case 'CANCELLED': status = 'Process Cancelled'; break;
				default:
					break;
			}
			
			if(exStatus != status){*/
				this.wpsClusterManager._updateInstance(r);
			/*}*/
			
        }, this);
        
        
        //console.log(r.get('phase') + " "+r.get('executionStatus'));
        // store pending task
        if((!r.get('phase') || (r.get('phase') == 'RUNNING')) && (r.get('executionStatus') != 'Failed')){
            //console.log("Incrementing pending task");
            this.pendingRows += 1;
            //console.log(this.pendingRows);
        }
        
        r.endEdit();
    },
    
    updateFormStatus: function() {
        //enable buffer only if layer, crs and selection mode have a value
        if(this.formPanel.layerCombo.getValue() && this.formPanel.crsCombo.getValue()
            && this.formPanel.selectionMode.getValue() && this.spatialSelection.features.length > 0) {
            this.formPanel.bufferField.enable();
        } else {
            this.formPanel.bufferField.disable();
        }
        
		var layer = this.formPanel.layerCombo.getValue();
		
		//
		// If the layer is a raster layer the cut mode combo should not be enabled
		//
		var layerComboStore = this.formPanel.layerCombo.getStore();
		var layerRecordIndex = layerComboStore.find('name', layer);
		var layerRecord = layerComboStore.getAt(layerRecordIndex);
		var isRaster = layerRecord.data.wcs;  

        if(layer && this.formPanel.crsCombo.getValue()) {
            this.formPanel.selectionMode.enable();
            this.formPanel.placeSearch.enable();
			if(!isRaster){
				this.formPanel.cutMode.enable();
			}else{
				this.formPanel.cutMode.disable();
			}
        } else {
            this.formPanel.selectionMode.disable();
            this.formPanel.placeSearch.disable();
            this.formPanel.cutMode.disable();
        }
        
        // show the vector filter fieldset if layer is selected and it is not a raster
        if(layer && !isRaster) {
            this.vectorFilterContainer.show();
        } else {
            this.vectorFilterContainer.collapse();
            this.vectorFilterContainer.hide();
        }
    },
    
    bufferSpatialSelection: function(buffer) {
        if(!this.originalGeometry && this.spatialSelection.features.length == 0) return;
        var feature = this.unBufferedFeature || this.spatialSelection.features[0];
        
        this.showMask();
        
        var request = {
            type: "raw",
            inputs:{
                geom: new OpenLayers.WPSProcess.ComplexData({
                    value: feature.geometry.toString(),
                    mimeType: "application/wkt"
                }),
                distance: new OpenLayers.WPSProcess.LiteralData({value:buffer})
            },
            outputs: [{
                identifier: "result",
                mimeType: "application/wkt"
            }]
        };

        this.wpsClusterManager.execute('JTS:buffer', request, function(response) {
            if(response) {
                try {
                    var geometry = OpenLayers.Geometry.fromWKT(response);
                } catch(e) {
                    return Ext.Msg.show({
                        title: this.errBufferTitle,
                        msg: this.errBufferMsg,
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR
                    });
                }
                var bufferedFeature = new OpenLayers.Feature.Vector(geometry);
                this.spatialSelection._preventBufferReset = true;
                this.spatialSelection.addFeatures([bufferedFeature]);
                this.spatialSelection._preventBufferReset = false;
                this.unBufferedFeature = feature; //copy the "original" feature, without any buffer applied
                this.target.mapPanel.map.zoomToExtent(geometry.getBounds());
            }
            
            this.hideMask();
        }, this)
    },
    
    // check if the selected layer is raster or vector by performing a DescribeFeatureType and a DescribeCoverage
    getLayerType: function(layer, callback, scope) {
        var layerSource = this.target.layerSources[layer.source],
            url = layerSource.url,
            questionMarkIndexOf = url.indexOf('?'),
            separator, wfsUrl, wcsUrl;
        
        //if we found the "wcs" keyword, just return WCS
        if(layer.wcs) return callback.call(this, 'WCS');
        
        this.showMask();
        
        if(questionMarkIndexOf > -1) {
            if(questionMarkIndexOf < url.length) separator = '&';
        } else {
            separator = '?';
        }
        
        wfsUrl = url + separator + 'service=WFS&request=DescribeFeatureType&version='+this.wfsDefaultVersion+'&typeName='+layer.name;
        wcsUrl = url + separator + 'service=WCS&request=DescribeCoverage&version='+this.wcsDefaultVersion+'&identifiers='+layer.name;
        
        //DescribeCoverage request: if it returns a valid DescribeCoverage response, return the WCS layer type
        // function is needed because we need to execute it if the DescribeFeatureType parsing fails and if the request fails
        var checkDescribeCoverage = function() {
            var requestUrl = this.isSameOrigin(wcsUrl) ? wcsUrl : this.target.proxy + encodeURIComponent(wcsUrl);
            Ext.Ajax.request({
                url: requestUrl,
                method: 'GET',
                scope: this,
                success: function(response) {
                    this.hideMask();
                    var format = new OpenLayers.Format.XML();
                    try {
                        var xml = format.read(response.responseText);
                        if(xml.getElementsByTagName("wcs:CoverageDescription").length > 0 || xml.getElementsByTagName("CoverageDescription").length > 0) {
                            return callback.call(scope, 'WCS');
                        }
                    } catch(e) {
                        console.log('no wcs', response, e);
                    }
                    return callback.call(scope);
                },
                failure: function(response) {
                    this.hideMask();
                    return callback.call(scope);
                }
            });
        };
        
        //DescribeFeatureType request: if it returns a valid DescribeFeatureType response, return the WFS layer type
        var requestUrl = this.isSameOrigin(wfsUrl) ? wfsUrl : this.target.proxy + encodeURIComponent(wfsUrl);
        Ext.Ajax.request({
            url: requestUrl,
            method: 'GET',
            scope: this,
            success: function(response, opts){
                var format = new OpenLayers.Format.WFSDescribeFeatureType();
                try {
                    var dftResponse = format.read(response.responseXML || response.responseText);
                    if(dftResponse && dftResponse.featureTypes && dftResponse.featureTypes.length > 0) {
                        this.hideMask();
                        return callback.call(scope, 'WFS');
                    }
                } catch(e) {
                    console.log('no wfs', response, e);
                }
                checkDescribeCoverage.call(this);
            },
            failure: checkDescribeCoverage
        });     
    },
    
    createVectorFilterForm: function(schema) {        
        this.vectorFilterContainer.removeAll();
        this.vectorFilterContainer.add({
            xtype: "gxp_filterbuilder",
            ref: "../filterBuilder",
            attributes: schema,
            allowBlank: true,
            allowGroups: false
        });
    },
    
    showMask: function() {
        if(!this.loadMask) this.loadMask = new Ext.LoadMask(this.formPanel.getEl());
        this.loadMask.show();
    },
    
    hideMask: function() {
        this.loadMask.hide();
    },
    
    isSameOrigin: function(url) {
        var pattern=/(.+:\/\/)?([^\/]+)(\/.*)*/i;
        var mHost=pattern.exec(url); 
        return (mHost[2] == location.host);
    }
       
});

Ext.preg(gxp.plugins.DownloadPanel.prototype.ptype, gxp.plugins.DownloadPanel);
