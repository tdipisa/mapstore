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
						{boxLabel: 'Intersection', name: 'cb-col-2', inputValue: false, checked: true},
						{boxLabel: 'Clip', name: 'cb-col-2', inputValue: true}
					]
				}
			]
		});

        optionalSettings = new Ext.form.FieldSet({
            title: "Optional Settings",
            items: [
                {
                    xtype: "textfield",
                    ref: "../filterField",
                    fieldLabel: "Filter",
                    width: 140,
                    disabled: false                 
                },
                {
                    xtype: "textfield",
                    ref: "../emailField",
                    fieldLabel: "Email",
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
                    header   : 'ID', 
                    width    : 30, 
                    hidden : true, 
                    dataIndex: 'id'
                },
                {
                    id       : 'executionId',
                    header   : 'execID', 
                    width    : 45, 
                    sortable : true, 
                    dataIndex: 'executionId'
                },
                {
                    id       : 'executionStatus',
                    header   : 'Process Status', 
                    width    : 80, 
                    dataIndex: 'executionStatus'
                    /*
                    ,xtype: 'templatecolumn'
                    ,tpl: '<tpl if="executionStatus == &quot;Process Accepted&quot;">Accepted</tpl>'+
                         '<tpl if="executionStatus == &quot;Process Succeeded&quot;">Completed</tpl>'+
                         '<tpl if="executionStatus == &quot;Process Running&quot;">Running</tpl>'+
                         '<tpl if="executionStatus == &quot;Process Failed&quot;">Failed</tpl>'
                    */
                },
                {
                    xtype: 'actioncolumn',
                    header: 'Actions', 
                    width: 40,
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
                                        icnClass = 'accept';
                                        tooltip = 'Accepted';
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
                    header: 'Delete', 
                    width: 40,
                    hidden: true,
                    items: [{
                        iconCls: 'decline',
                        tooltip: 'Delete',
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = store.getAt(rowIndex);
                            var id = rec.get('id');
                            Ext.Msg.confirm({
                                title: "Remove Instance",
                                msg: "Do you want to delete instance "+id+"?",
                                fn: this.removeInstance(id),
                                scope: this
                            });
                            //this.removeInstance(id);
                        },
                        scope: this
                    }]
                },{
                    id       : 'phase',
                    header   : 'PHASE', 
                    width    : 60, 
                    sortable : true, 
                    dataIndex: 'phase'
                },
                {
                    id       : 'progress',
                    header   : 'PROGRESS', 
                    width    : 66, 
                    sortable : true, 
                    dataIndex: 'progress'
                },
                {
                    id       : 'result',
                    header   : 'RESULT', 
                    width    : 50, 
                    sortable : true, 
                    dataIndex: 'result'
                }
            ],
            //stripeRows: true,
            //autoExpandColumn: 'description',
            height: 150,
            //width: 600,
            title: 'Results',
            /*
            // config options for stateful behavior, cookie
            stateful: true,
            stateId: 'resultsState',
            */
            listeners:{
                viewready:{
                    fn: function(){
                        this.getInstances(false);
                        this.startRunner();
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
			title: "Download",
			labelWidth: 80,
            autoHeight: true,
			monitorValid: true,
			items:[
				this.laySel,
				spatialSettings,
				optionalSettings,
				this.resultPanel
			],
			buttons:[
				'->',
				{
					text: "Refresh",
					scope: this,
					handler: function(){
						this.getInstances(true);
					}
				},
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
						
						// DEBUG
						/*
						var alle = "";
						var fv = downloadForm.getForm().getFieldValues();
                        for(var key in fv)
                            alle += ("["+key+"] = "+fv[key]+"\n");
                        alert(alle);
						*////
						
						var isValid = layerCombo && crsCombo && formatCombo && 
							selectionMode && bufferField && cutMode;
						if(isValid){
							//alert(isValid);		
    						var asreq = this.getAsyncRequest(downloadForm);
    						this.wpsManager.execute('gs:Download', asreq, this.executeCallback, this)
    						this.startRunner();
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
        Ext.Msg.show({
            title: "Execute Response" ,
            msg: Ext.encode(instanceOrRawData),
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.INFO
        });
        var task = new Ext.util.DelayedTask(this.getInstances, this, [false]);
        task.delay(1000); 
        //setTimeout("getInstances(false)", 1000);
    },
    
    getAsyncRequest: function(dform){
    
        // default true
        var crop= "false";
        var cropSel = dform.cutMode.getValue();
        if(cropSel)
            crop = (dform.cutMode.getValue().getGroupValue()?"true":"false");
        
        var layer = dform.layerCombo.getValue();
        var crs = dform.crsCombo.getValue();
        var format = dform.formatCombo.getValue();
        //var selectionMode = dform.selectionMode.getValue().getGroupValue();
        
        console.log(this.spatialSelection);
        var wkt ;
        if(this.spatialSelection.features.length){
            var formatwkt = new OpenLayers.Format.WKT();
            var feature = this.spatialSelection.features[0];
            wkt = formatwkt.write(feature);
            var choosenProj = new OpenLayers.Projection(crs);
            var mapProj = this.target.mapPanel.map.getProjectionObject();
            var clone = feature.geometry.clone();
            clone.transform(mapProj, choosenProj);
            var tf = new OpenLayers.Feature.Vector(clone);
            wkt = formatwkt.write(tf);
            console.log(wkt);
        }
        
        var bufferField = dform.bufferField.getValue();
        var filterField = dform.filterField.getValue();
        var emailField = dform.emailField.getValue();
        
        return {
            storeExecuteResponse: true,
            lineage:  true,
            status: true,
            inputs:{
                layerName : new OpenLayers.WPSProcess.LiteralData({value:layer}),
                outputFormat:new OpenLayers.WPSProcess.LiteralData({value:"application/gml-3.1.1"}),
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
        });
         
    },
    
    removeInstance: function(instanceID){
        this.wpsManager.deleteExecuteInstance(instanceID, function(instances){
            Ext.Msg.show({
                title: "Remove Instance",
                msg: "Instance " + instanceID+ " removed.",
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
        
        /*
        var records = store.getRange();
        for(var r in records){  }
        */
        var store = this.resultPanel.getStore();
        //if(!this.runningTask)
        this.runningTask = Ext.TaskMgr.start({
            run: function(){
                store.each(this.updateRecord, this);
                // TODO: salvare i record dopo che sono stati aggiornati?
            },
            interval: 10000,
            scope: this
        });
        //else Ext.TaskMgr.start(this.runningTask);
        
        
    },
    stopRunner: function(){
        // TODO: fermare solo il mio task
        Ext.TaskMgr.stopAll();
        if(this.runningTask)
            Ext.TaskMgr.stop(this.runningTask);
        
    },
    
    updateRecord: function(r){
        
        if(!r.get('executionId')){
            return;
        }
        
        // TODO: i nomi dei campi delle due richieste wps non coincidono, workaround temporaneo
        if( r.get('phase') == 'COMPLETED' || 
            r.get('phase') == 'FAILED' ){
            return;
        }
        
        /*
        // Reader con Extjs
        var xmlrecord = Ext.data.Record.create([
           {name: 'executionId'},     
           {name: 'phase'},
           {name: 'progress'},
           {name: 'result'}
        ]);
        var myReader = new Ext.data.XmlReader({
           record: "org.geoserver.wps.executor.ProcessStorage_-ExecutionStatusEx" // The repeated element which contains row information
        }, xmlrecord);
        
        
        // reader con OpenLayers
        var format = new OpenLayers.Format.XML();
        var doc = null;
        */
        
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
            /*
            console.log("Risposta ClusterManager");
            console.log(response);
                        
            var records = myReader.readRecords(response);
            console.log(records);
            
            doc = format.read(response);
            console.log(doc.childNodes);
            */
            var element =  Ext.decode(response);
            
            if(!("list" in element)){
                alert("Lista non esistente");
                return;
            }
            
            var list = element.list;
            var magicString = 'org.geoserver.wps.executor.ProcessStorage_-ExecutionStatusEx';
            
            if(!(magicString in list)){
                alert("Lista vuota");
                for (var i in list){
                    console.log(i);
                    console.log(list[i]);
                }
                return;
            }
            
            var x = list[magicString];
            if( x && (x.length > 0) ){
                r.set('phase', x[0].phase);
                r.set('progress', x[0].progress);
                r.set('result', x[0].result);
            } 
            
        }, this)
        
        
        
        r.endEdit();
    }

       
});

Ext.preg(gxp.plugins.DownloadPanel.prototype.ptype, gxp.plugins.DownloadPanel);
