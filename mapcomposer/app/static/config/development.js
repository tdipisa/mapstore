{
   "geoStoreBase": "",
   "proxy":"/http_proxy/proxy/?url=",
   "defaultLanguage": "en",
   "gsSources":{ 
		"geosol":{
			"ptype": "gxp_wmssource",
			"url": "http://demo1.geo-solutions.it/geoserver-enterprise/ows",
			"version":"1.1.1",
            "layerBaseParams": { 
				"TILED": true,
				"TILESORIGIN": "-180,-90"
            }
		},
		"mapquest": {
			"ptype": "gxp_mapquestsource"
		}, 
		"osm": { 
			"ptype": "gxp_osmsource"
		},
		"google": {
			"ptype": "gxp_googlesource" 
		},
		"bing": {
			"ptype": "gxp_bingsource" 
		}, 
		"ol": { 
			"ptype": "gxp_olsource" 
		}
	},
	"map": {
		"projection": "EPSG:900913",
		"units": "m",
		"center": [1250000.000000, 5370000.000000],
		"zoom":5,
		"maxExtent": [
			-20037508.34, -20037508.34,
			20037508.34, 20037508.34
		],
		"layers": [
			{
				"source": "bing",
				"title": "Bing Aerial",
				"name": "Aerial",
				"group": "background"
			}, {
				"source": "osm",
				"title": "Open Street Map",
				"name": "mapnik",
				"group": "background"
			},{
				"source": "mapquest",
				"title": "MapQuest OpenStreetMap",
				"name": "osm",
				"group": "background"
			},{
				"source": "google",
				"title": "Google Roadmap",
				"name": "ROADMAP",
				"group": "background"
			},{
				"source": "google",
				"title": "Google Terrain",
				"name": "TERRAIN",
				"group": "background"
			},{
				"source": "google",
				"title": "Google Hybrid",
				"name": "HYBRID",
				"group": "background"
			},{
				"source": "geosol",
				"title": "Cities",
				"name": "geosolutions:cities"
			}
		]
	},
    "customPanels":[
        {
            "xtype": "panel",
            "title": "Metadata Explorer",
            "iconCls": "csw-viewer",             
            "border": false,
            "id": "south",
            "region": "south",
            "layout": "fit",
            "split":true,
            "height": 330,
            "collapsed": true,
            "collapsible": true,
            "ctCls": "south-panel",
            "header": true
        }
    ],	
	"scaleOverlayUnits":{
        "bottomOutUnits":"nmi",    
        "bottomInUnits":"nmi",    
        "topInUnits":"m",    
        "topOutUnits":"km"
    },
	
	"customTools":[
		{
			"actions": ["-"], 
			"actionTarget": "paneltbar"
		}, {
			"ptype": "gxp_metadataexplorer",
			"id": "metadataexplorer",
            "outputTarget": "south",
            "cswconfig": {
                "catalogs": [
                        {"name": "CSI Piemonte", "url": "http://www.ruparpiemonte.it/geocatalogorp/geonetworkrp/srv/it/csw", "description": "GeoPortale della Regione Piemonte"},
                        {"name": "Comune di Firenze", "url": "http://datigis.comune.fi.it/geonetwork/srv/it/csw", "description": "GeoPortale del Comune di Firenze"},
                        {"name": "PTA", "url": "http://pta.partout.it/geoportalPTA/csw", "description": "Piattaforma Tecnologica alpina", "metaDataOptions":{"base":"http://pta.partout.it/geoportalPTA/catalog/search/resource/details.page","idParam":"uuid","idIndex":0}},
                        {"name": "Treviso", "url": "http://ows.provinciatreviso.it/geonetwork/srv/it/csw", "description": "Treviso Geonetwork"},
                        {"name": "kscNet", "url": "http://geoportal.kscnet.ru/geonetwork/srv/ru/csw", "description": "kscNet"},
                        {"name": "CSI-CGIAR", "url": "http://geonetwork.csi.cgiar.org/geonetwork/srv/en/csw", "description" : "CSI-CGIAR"},
                        {"name": "EauFrance", "url": "http://sandre.eaufrance.fr/geonetwork/srv/fr/csw", "description" : "EauFrance"},
                        {"name": "SOPAC", "url": "http://geonetwork.sopac.org/geonetwork/srv/en/csw", "description" : "SOPAC"},
                        {"name": "SADC", "url": "http://www.sadc.int/geonetwork/srv/en/csw", "description" : "SADC"},
                        {"name": "MAPAS", "url": "http://mapas.mma.gov.br/geonetwork/srv/en/csw", "description" : "MAPAS"}
                    ],
                "dcProperty": "title",
                "initialBBox": {
                    "minx": 11.145,
                    "miny": 43.718,
                    "maxx": 11.348,
                    "maxy": 43.84
                },
                "cswVersion": "2.0.2",
                "filterVersion": "1.1.0",
                "start": 1,
                "limit": 10,
                "timeout": 60000
            }            
		}, {
			"actions": ["->"], 
			"actionTarget": "paneltbar"
		}, {
			"ptype": "gxp_reversegeocoder",
			"outputTarget":"paneltbar",
			"outputConfig": {
				"width": "200"
			},
			"index": 26
		}, {
			"ptype": "gxp_dynamicgeocoder",
			"outputTarget":"paneltbar",
			"index": 27
		}, {
			"ptype": "gxp_addlayer",
			"showCapabilitiesGrid": true,
			"id": "addlayer",
			"useEvents": true
		}, {
			"ptype": "gxp_download",
			"outputTarget": "west",
			"index": 28,
			"wpsUrl": "http://localhost:8080/geoserver/ows?service=WPS",
			"wpsProxy": "/proxy/?url=",
			"geostoreUrl": "http://localhost:8080/geostore/rest",
            "geostoreProxy": "/proxy/?url=",
            "geostoreUser": "admin",
            "geostorePassword": "admin",
            "gazetteerUrl": "http://sditest.provinz.bz.it/proxy/names/services?service=WFS",
			"sridLinkTpl": "http://spatialreference.org/ref/#AUTH#/#SRID#/",
			"formats": {
				"wfs":[
					["application/zip", "ESRI Shapefile", "wfs", "zip"],
					["application/dxf", "DXF", "wfs", "dxf"],
					["application/gml-2.1.2", "GML2", "wfs", "gml"],
					["application/gml-3.1.1", "GML3", "wfs", "gml"]
				],
				"wcs":[
					["image/tiff", "GeoTIFF", "wcs", "tif"]
				]
			},
			"targetCSR": [
				["EPSG:25832"],
				["EPSG:32632"],
				["EPSG:2056"],
				["EPSG:21781"],
				["EPSG:23031"],
				["EPSG:23032"],
				["EPSG:2397"],
				["EPSG:2398"],
				["EPSG:2399"],
				["EPSG:25833"],
				["EPSG:3034"],
				["EPSG:3035"],
				["EPSG:3043"],
				["EPSG:3044"],
				["EPSG:3045"],
				["EPSG:3068"],
				["EPSG:31251"],
				["EPSG:31252"],
				["EPSG:31253"],
				["EPSG:31254"],
				["EPSG:31255"],
				["EPSG:31256"],
				["EPSG:31257"],
				["EPSG:31258"],
				["EPSG:31259"],
				["EPSG:31281"],
				["EPSG:31282"],
				["EPSG:31283"],
				["EPSG:31284"],
				["EPSG:31285"],
				["EPSG:31286"],
				["EPSG:31287"],
				["EPSG:31288"],
				["EPSG:31289"],
				["EPSG:31290"],
				["EPSG:31466"],
				["EPSG:31467"],
				["EPSG:31468"],
				["EPSG:31469"],
				["EPSG:32631"],
				["EPSG:32633"],
				["EPSG:32634"],
				["EPSG:3326"],
				["EPSG:3333"],
				["EPSG:3396"],
				["EPSG:3397"],
				["EPSG:3399"],
				["EPSG:3416"],
				["EPSG:3833"],
				["EPSG:3834"],
				["EPSG:3835"],
				["EPSG:3837"],
				["EPSG:3838"],
				["EPSG:3857"],
				["EPSG:4258"],
				["EPSG:4326"],
				["EPSG:900913"]
			]
		}	
	]
}
