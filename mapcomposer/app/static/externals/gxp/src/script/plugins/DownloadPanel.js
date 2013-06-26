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
    
    /** api: config[wpsProxy]
     *  ``String``
     */
    wpsProxy: null,
    
    /** api: config[geostoreUrl]
     *  ``String``
     */
    geostoreUrl: null,
    
    /** api: config[geostoreProxy]
     *  ``String``
     */
    geostoreProxy: null,
    
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
     *  ``gxp.plugins.WPSManager``
     */
    wpsManager: null,
    
    tabTitle: "Download",
    
    dselTitle: "Data Selection",
    dselLayer: "Layer",
    dselCRS: "Target CRS",
    dselFormat: "Format",
    
    settingTitle: "Spatial Settings",
    settingSel: "Selection Mode",
    settingCut: "Cut Mode",
    
    optTitle: "Optional Settings",
    optEmail: "Filter",
    optEmail: "Email",

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
    msgRemRunningMsg:  "You are about to delete a running instance, you will not be able to retreave the result\nDo you really want to delete instance ?",
    msgRemTitle: "Remove Instance",
    msgRemMsg: "Do you want to delete instance ?",
    msgRemDone: "Instance removed.",
    
    errWPSTitle: "DownloadProcess not supported",
    errWPSMsg: "This WPS server does not support gs:Download process",
    
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
							this.spatialSettings.cutMode.disable();
						}else{
							this.formatStore.loadData(this.formats.wfs, false);
                            this.spatialSettings.cutMode.enable();
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
                /*
                this.spatialSelection.events.register("featureadded", this, function(feature){
                    var formatwkt = new OpenLayers.Format.WKT();

                    this.wkt = formatwkt.write(feature);
                    console.log(this.wkt);
                });
				*/
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
				
				if (!this.wpsManager){
				    this.wpsManager = new gxp.plugins.WPSManager({
                        id: "DownloadPanelWPSManager",
                        url: this.wpsUrl,
                        proxy: this.wpsProxy,
                        geoStoreClient: new gxp.plugins.GeoStoreClient({
                            url: this.geostoreUrl,
                            user: this.geostoreUser,
                            password: this.geostorePassword,
                            proxy: this.geostoreProxy,
                            listeners: {
                                "geostorefailure": function(tool, msg){
                                    Ext.Msg.show({
                                        title: "Geostore Exception" ,
                                        msg: msg,
                                        buttons: Ext.Msg.OK,
                                        icon: Ext.Msg.ERROR
                                    });
                                }
                            }
                        })
                    });
                    
                    this.wpsManager.execute = function(processName, executeRequest, callback, scope) {
                        if(!scope)
                            scope = this;
                            
                        var process = this.wpsClient.getProcess('opengeo', processName);    
                        var instanceName=null;
                        var executeOptions;
                        var me= this;
                        
                        if(executeRequest instanceof Object){                
                            executeOptions= executeRequest;
                        }else{                
                            executeOptions= new OpenLayers.Format.WPSExecuteRequest().read(executeRequest).processInput;                        
                        }   
                        
                        instanceName=this.getInstanceName(processName);
                        executeOptions.scope= this;
                        executeOptions.success= function(response, processInstance){
                            if(processName == 'gs:Download') 
                                me.responseManager(response, processInstance);
                            callback.call(scope, response);
                        };
                       
                        executeOptions.processInstance=instanceName;                        
                        process.execute(executeOptions);                        
                        return instanceName;
                    }
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
							
                            var Request = Ext.Ajax.request({
                                url: this.wpsProxy + encodeURIComponent(this.wpsUrl+"&version=1.0.0&request=DescribeProcess&identifier=gs:Download"),
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
					allowBlank: false					
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

		this.spatialSettings = new Ext.form.FieldSet({
			title: this.settingTitle,
			items: [
				{
					xtype: 'radiogroup',
					ref: "../selectionMode",
					fieldLabel: this.settingSel,
					itemCls: 'x-check-group-alt',
					columns: 1,
					width: 140,
					allowBlank: false,
					items: [
						{boxLabel: 'Box', name: 'cb-col-1', value: 'box'}
						,{boxLabel: 'Polygon', name: 'cb-col-1', value: 'polygon'}
						//,{boxLabel: 'Place', name: 'cb-col-1', value: 'place'}
					],
					listeners: {
						scope: this,
						change: function(group, checked){
							this.toggleControl(checked);
						}
					}
				},
				/*
				{
					xtype: "numberfield",
					ref: "../bufferField",
					fieldLabel: "Buffer (m)",
					width: 140,
					disabled: false					
				},*/
			    {
					xtype: 'radiogroup',
					ref: "cutMode",
					fieldLabel: this.settingCut,
					itemCls: 'x-check-group-alt',
					columns: 1,
					items: [
						{boxLabel: 'Intersection', name: 'cb-col-2', inputValue: false, checked: true},
						{boxLabel: 'Clip', name: 'cb-col-2', inputValue: true}
					]
				}
			]
		});

        optionalSettings = new Ext.form.FieldSet({
            title: this.optTitle,
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
                    ref: "../emailField",
                    fieldLabel: this.optEmail,
                    width: 140,
                    disabled: false                 
                },
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
                    id       : 'executionId',
                    header   : this.resExecID, 
                    width    : 45, 
                    sortable : true, 
                    dataIndex: 'executionId'
                },
                {
                    id       : 'executionStatus',
                    header   : this.resProcStatus, 
                    width    : 84, 
                    dataIndex: 'executionStatus'
                    ,renderer:  function (val, obj, record) {
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
                    width: 30,
                    items: [{
                            getClass: function(v, meta, rec) { 
                                var tooltip = '', icnClass='decline';
                                switch (rec.get('executionStatus')) {    
                                    case 'Process Pending':
                                    case 'Pending':
                                        icnClass = 'decline';
                                        tooltip = 'Pending';
                                        break;
                                    case 'Process Succeeded':
                                    case 'Succeeded':
                                        icnClass = 'accept';
                                        tooltip = 'Success';
                                        break;
                                    case 'Process Started':
                                    case 'Started':
                                        icnClass = 'accept';
                                        tooltip = 'Executing';
                                        break;
                                    case 'Process Accepted':
                                    case 'Accepted':
                                        if(rec.get('phase')=='COMPLETED'){
                                            icnClass = 'accept';
                                            tooltip = 'Success';
                                        }else{
                                            icnClass = 'loading';
                                            tooltip = 'Accepted';
                                        }
                                        break;
                                    default:
                                        icnClass = 'decline';
                                        tooltip = rec.get('executionStatus');
                                        break;
                                }
                                this.items[0].tooltip = tooltip;
                                return icnClass;
                            },
                            handler: function(grid, rowIndex, colIndex) {
                                var rec = store.getAt(rowIndex);
                                if(rec.get('executionStatus').indexOf('Succeeded')!= -1){
                                    mydlp.getInstance(rec.get('id'));
                                }
                            }
                    }]
                },
                {
                    xtype: 'actioncolumn',
                    header: this.resDelete, 
                    width: 40,
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
                    width    : 60, 
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
                    width: 40
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
                    ,renderer:function (val, obj, record) {
                                if(!val)
                                    return;
                                return '<a href="' + record.data.result + '" target="_blank" /><img src="theme/app/img/download.png" /></a>';
                            }
                    ,dataIndex: 'result'

                },
            ],
            //stripeRows: true,
            //autoExpandColumn: 'description',
            height: 150,
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
			labelWidth: 80,
            autoHeight: true,
			monitorValid: true,
			items:[
				this.laySel,
				this.spatialSettings,
				optionalSettings,
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
						//var bufferField = downloadForm.bufferField.isValid();
						var cutMode = downloadForm.cutMode.isValid();
												
						var isValid = layerCombo && crsCombo && formatCombo && 
							selectionMode  && cutMode; //&& bufferField
						
						if(!isValid){
						    Ext.Msg.show({
                                title: this.errMissParamsTitle,
                                msg: this.errMissParamsMsg,
                                buttons: Ext.Msg.OK,
                                icon: Ext.Msg.INFO
                            });
                            return;
						}
						if(this.spatialSelection.features.length){
							var asreq = this.getAsyncRequest(downloadForm);
    						this.wpsManager.execute('gs:Download', asreq, this.executeCallback, this)
    						// startRunner()
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
		return panel;
    },
    
    /**
     * private 
     */        
    executeCallback: function(instanceOrRawData){
        //console.log(instanceOrRawData);
        /*
        Ext.Msg.show({
            title: "Execute Response" ,
            msg: Ext.encode(instanceOrRawData),
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.INFO
        });
        */
        var task = new Ext.util.DelayedTask(this.getInstances, this, [false]);
        task.delay(1000); 
        //setTimeout("getInstances(false)", 1000);
    },
    
    getAsyncRequest: function(dform){
    
        // default true
        var crop = "false";
        var cropSel = dform.cutMode.getValue();
        
        if(cropSel)
            crop = cropSel.inputValue === true ? "true" : "false";
        
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
            
            clone.transform(mapProj, choosenProj);
                       
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
        
        //var buffer = dform.bufferField.getValue();
        //var filter = dform.filterField.getValue();
        var email = dform.emailField.getValue();
        /*        
        if(dform.filterField.isValid() && filter != ''){
            request.inputs['filter'] = new OpenLayers.WPSProcess.LiteralData({value:filter});
        }
        */
        if(dform.emailField.isValid() && email != ''){
            request.inputs['email'] = new OpenLayers.WPSProcess.LiteralData({value:email});
        }
        
        return request;
    },    
    
    getInstances: function(update){
        
        // TODO getExecuteInstances deve essere slegato da geostore
        var me = this;
        this.wpsManager.getExecuteInstances("gs:Download", update, function(instances){
            var store = me.resultPanel.getStore();
            store.removeAll();
            var dsc, p;
            for(var i=0; i<instances.length; i++){
                //console.log(instances[i]);
                var data = {
                    id: '',
                    executionId: '',
                    executionStatus: '',
                    description: '',
                    description: '',
                    description: '',
                    status:''
                };
                data.id = instances[i].id;
                //data.name = instances[i].name;
                dsc = Ext.decode(instances[i].description);
                //console.log(dsc);
                switch(dsc.status){
                    case 'Process Started':
                    case 'Process Accepted':
                    case 'Process Paused':
                    case 'Process Failed':
                    case 'Process Succeeded':
                        data.executionStatus = dsc.status.replace('Process ', '');;
                        break;
                    default:
                        data.executionStatus = dsc.status;
                        break;
                }
                if(dsc.statusLocation){
                    data.description = dsc.statusLocation;
                    var getParams = dsc.statusLocation.split("?");
                    if(getParams.length>1){
                        var params = Ext.urlDecode(getParams[1]);
                        if(params.executionId){
                            data.executionId = params.executionId;
                        }
                    }
                }
                //console.log(data);
                p = new store.recordType(data); // create new record
                store.add(p);
            }
            me.resultPanel.getView().refresh();
            me.startRunner();
        });
         
    },
    deleteHandler: function(grid, rowIndex, colIndex) {
            var rec = grid.getStore().getAt(rowIndex);
            var id = rec.get('id');
            
            if(rec.get('executionStatus')=='Accepted'){
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
        var title = this.msgRemTitle;
        var msg = this.msgRemDone;
        this.wpsManager.deleteExecuteInstance(instanceID, function(instances){
            Ext.Msg.show({
                title: title,
                msg: msg,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
            });
        });
        this.getInstances(false);
    },
    
    getInstance: function(instanceID){
        
        this.wpsManager.getExecuteInstance(instanceID, false, function(instance){
           
            var tpl = new Ext.XTemplate(
                '<table class="gridtable">',
                '<tr><th>ID</th>',
                '<td>{id}</td></tr>',
                '<tr><th>Name</th>',
                '<td>{name}</td></tr>',
                '<tr><th>Creation</th>',
                '<td>{creation}</td></tr>',
                '<tr><th>Description</th>',       
                '<td>{description}</td></tr>',
                '<tr><th>Category</th>',          
                '<td>{category}</td></tr>',
                '<tr><th>Metadata</th>',          
                '<td>{metadata}</td></tr>',
                '<tr><th>Attributes</th>',        
                '<td>{attributes}</td></tr>',
                '<td>{store}</td></tr>',
                '</table>'
                );
          
            instance.Resource.store= Ext.encode(instance.Resource.data);
            instance.Resource.category= Ext.encode(instance.Resource.category);
            Ext.Msg.show({
                title: "Instance " + instance.Resource.id ,
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
        
        
        if(!r.get('executionId')){
            return;
        }
        
        // TODO: i nomi dei campi delle due richieste wps non coincidono, workaround temporaneo
        if( r.get('executionStatus') == 'Failed'){
            return;
        }
        
        if( r.get('phase') && r.get('phase') != 'RUNNING' ){
            return;
        }
        
        r.beginEdit();
        
        var richiesta = {
            type: "raw",
            inputs:{
                executionId : new OpenLayers.WPSProcess.LiteralData({value:r.get('executionId')}),
            },
            outputs: [{
                identifier: "result",
                mimeType: "application/json"
            }]
        };

        this.wpsManager.execute('gs:ClusterManager', richiesta, function(response){
            var element =  Ext.decode(response);
            
            if(!("list" in element)){
                alert("Lista non esistente");
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
            
        }, this)
        
        
        //console.log(r.get('phase') + " "+r.get('executionStatus'));
        // store pending task
        if((!r.get('phase') || (r.get('phase') == 'RUNNING')) && (r.get('executionStatus') != 'Failed')){
            //console.log("Incrementing pending task");
            this.pendingRows += 1;
            //console.log(this.pendingRows);
        }
        
        r.endEdit();
    }

       
});

Ext.preg(gxp.plugins.DownloadPanel.prototype.ptype, gxp.plugins.DownloadPanel);
