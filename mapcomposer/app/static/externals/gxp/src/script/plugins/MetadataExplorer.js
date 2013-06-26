/** *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S. *  http://www.geo-solutions.it * *  GPLv3 + Classpath exception * *  This program is free software: you can redistribute it and/or modify *  it under the terms of the GNU General Public License as published by *  the Free Software Foundation, either version 3 of the License, or *  (at your option) any later version. * *  This program is distributed in the hope that it will be useful, *  but WITHOUT ANY WARRANTY; without even the implied warranty of *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the *  GNU General Public License for more details. * *  You should have received a copy of the GNU General Public License *  along with this program.  If not, see <http://www.gnu.org/licenses/>. */Ext.namespace("gxp.plugins");/** api: constructor *  .. class:: MetadataExplorer(config) * *    Base class to  * *    ``...`` method. *       *	  Author: */gxp.plugins.MetadataExplorer = Ext.extend(gxp.plugins.Tool, {    /** api: ptype = gxp_metadataexplorer */    ptype: "gxp_metadataexplorer",    id: "metadataexplorer",    /** private: property[target]     *  ``Object``     *  The object that this plugin is plugged into.     */    cswconfig: null,    /** private: method[constructor]     */    constructor: function (config) {            this.initialConfig = config;        Ext.apply(this, config);        gxp.plugins.MetadataExplorer.superclass.constructor.apply(this, arguments);    },    /** api: method[init]     *  :arg target: ``Object`` The object initializing this plugin.     */    init: function (target) {        gxp.plugins.MetadataExplorer.superclass.init.apply(this, arguments);        this.target = target;    },    /** api: method[addActions]     */    addActions: function (config) {        if (this.initialConfig.outputTarget) {            this.addOutput();            return;        }        var actions = [{                iconCls: "csw-viewer",                tooltip: "Metadata Explorer",                handler: function () {                    var actionType = 'addActions';                    this.createOutput(actionType,this);                },                scope: this            }        ];        return gxp.plugins.MetadataExplorer.superclass.addActions.apply(this, [actions]);    },    addOutput: function (config) {        this.output = gxp.plugins.MetadataExplorer.superclass.addOutput.apply(this, [{                xtype: 'panel',                layout: "fit",                deferredRender: false,                autoScroll: false,                listeners: {                    scope: this,                    afterrender: function (panel) {                        var actionType = 'addOutput';                        this.createOutput(actionType, panel);                    }                }            }        ]);    },    createOutput: function (actionType, objType) {            var target = this.target,            me = this;        var extent = app.mapPanel.map.getExtent();        if (extent)            this.cswconfig.initialBBox = {                minx: extent.left,                miny: extent.bottom,                maxx: extent.right,                maxy: extent.top        };                var configure;        if(!app.CSWCatalogues){            configure = this.cswconfig;        }else{            if(app.mapId && app.mapId == -1){                configure = this.cswconfig;            }else{                this.cswconfig.catalogs = app.CSWCatalogues;                configure = this.cswconfig;                            }        }                var viewer = app;        var tab = appTabs;        var getFirstCollapseStatus = objType.collapsed;        // //////////////////////////////////////////////////////////////////////////        // Retrieve the language code to initialize the metadata explorer i18n.        // //////////////////////////////////////////////////////////////////////////        var locCode= GeoExt.Lang.locale;        var code = locCode || this.defaultLanguage;                // //////////////////////////////////        // Loads bundle for i18n messages        // //////////////////////////////////        i18n = new Ext.i18n.Bundle({            bundle: "CSWViewer",            path: "externals/csw/i18n",            lang: code == 'en' ? "en-EN" : (code == 'de' ? "de-DE" : (code == 'fr' ? "fr-FR" : "it-IT"))        });        i18n.onReady(function () {            //            // Declares a panel for querying CSW catalogs            //            this.cswPanel = new CSWPanel({                scope: this,                config: configure,                cswPanelMode: actionType,                listeners: {                    zoomToExtent: function (layerInfo) {                        var map = viewer.mapPanel.map;                        var bbox = layerInfo.bbox;                        if (bbox) {                            //                            // TODO: parse the urn crs code (like "urn:ogc:def:crs:::WGS 1984") inside the CSW BBOX tag.                             //                            bbox.transform(                                new OpenLayers.Projection("EPSG:4326"),                                new OpenLayers.Projection(map.projection));                            map.zoomToExtent(bbox);                        } else {                            Ext.Msg.show({                                title: viewer.cswZoomToExtent,                                msg: viewer.cswZoomToExtentMsg,                                width: 300,                                icon: Ext.MessageBox.WARNING                            });                        }                    },                    viewMap: function (el) {                        var mapInfo = el.layers;                        var uuid = el.uuid;                        var gnURL = el.gnURL;                        var title = el.title;                        var locale = this.scope.language;                                                for (var i = 0; i < mapInfo.length; i++) {                            var wms = mapInfo[i].wms;                            var layer = mapInfo[i].layer;                                                        var addLayer = app.tools["addlayer"];                                                        var options = {                                msLayerTitle: title,                                msLayerName: layer,                                wmsURL: wms,                                gnUrl: gnURL,                                enableViewTab: true,                                msLayerUUID: uuid,                                gnLangStr: locale == 'en-EN' ? "en" : (locale == 'de-DE' ? "de" : (locale == 'fr-FR' ? "fr" : "it"))                            };                                                        addLayer.addLayer(                                options                            );                        }                    }                }            });            //            // Overridding addListenerMD method to show metadata inside a new Tab.            //            this.cswPanel.cswGrid.plugins.tpl.addListenerMD = function (id, values) {                Ext.get(id).on('click', function (e) {                    //                    // open GN inteface related to this resource                    //                    if (values.identifier) {                        viewer.viewMetadata(                            values.metadataWebPageUrl,                            values.identifier,                            values.title);                    } else {                        //                        // Shows all DC values. TODO create dc visual                        //                        var text = "<ul>";                        var dc = values.dc;                        //eg. URI                        for (var el in dc) {                            if (dc[el] instanceof Array) {                                //cicle URI array                                for (var index = 0; index < dc[el].length; index++) {                                    //cicle attributes of dc                                    if (dc[el][index].value) {                                        text += "<li><strong>" + el + ":</strong> ";                                        for (name in dc[el][index]) {                                            text += "<strong>" + name + "</strong>=" + dc[el][index][name] + " ";                                        }                                        text += "</li>";                                    } else if (el == "abstract") {                                        text += "<li><strong>abstract:</strong> " + dc[el][index] + "</li> ";                                    } else {                                        //DO NOTHING                                    }                                }                            }                        }                        dc += "</ul>";                        var dcPan = new Ext.Panel({                            html: text,                            preventBodyReset: true,                            autoScroll: true,                            autoHeight: false,                            width: 600,                            height: 400                        });                        var dcWin = new Ext.Window({                            title: "MetaData",                            closable: true,                            width: 614,                            resizable: false,                            draggable: true,                            items: [                                dcPan                            ]                        });                        dcWin.show();                    }                });            };            if (actionType === 'addActions') {                var viewWin = new Ext.Window({                    width: 800,                    height: 565,                    id: 'csw-win',                    layout: 'fit',                    renderTo: viewer.mapPanel.body,                    modal: true,                    autoScroll: true,                    constrainHeader: true,                    closable: true,                    resizable: false,                    draggable: true,                    items: [                        this.cswPanel                    ],                    listeners: {                        close: function () {                            this.cswPanel.destroy();                            objType.actions[0].enable();                        }                    }                });                objType.actions[0].disable();                viewWin.show();                            } else {                objType.add(this.cswPanel);                objType.doLayout(false,true);            }        });    },    /** api: method[getState]     *  :returns {Object} - CSW catalogs added by the user     *       */        getState: function(state) {                var CSWCatalogues=[];        var newState = state;                if (typeof i18n !== 'undefined'){            var catalog = i18n.cswPanel.searchTool.catalogChooser;            var listCatalogs = CSWCatalogues;                    var configCatalogLength = listCatalogs.length;                        var catCount = catalog.store.getCount();            for(var i = 0; i<catCount - configCatalogLength; i++){                CSWCatalogues[configCatalogLength+i] = {                    description:catalog.store.getAt(i).data.description,                    name:catalog.store.getAt(i).data.description,                    url:catalog.store.getAt(i).data.url                };            }            newState.CSWCatalogues = CSWCatalogues;        }else{            newState.CSWCatalogues = app.CSWCatalogues || this.cswconfig.catalogs;        }                return newState;    }    });Ext.preg(gxp.plugins.MetadataExplorer.prototype.ptype, gxp.plugins.MetadataExplorer);