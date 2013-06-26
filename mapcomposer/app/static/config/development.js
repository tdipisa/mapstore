{
   "geoStoreBase": "",
   "proxy":"/http_proxy/proxy/?url=",
   "defaultLanguage": "en",
   "gsSources":{ 
		"geosol":{
			"ptype": "gxp_wmssource",
			"url": "http://localhost:8080/geoserver/ows",
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
					["shp", "ESRI Shapefile", "wfs", "zip"],
					["application/dxf", "DXF", "wfs", "dxf"],
					["application/gml-2.1.2", "GML2", "wfs", "gml"],
					["application/gml-3.1.1", "GML3", "wfs", "gml"]
				],
				"wcs":[
					["image/tiff", "GeoTIFF", "wcs", "tif"]
				]
			},
			"targetCSR": [
				["EPSG:26713"],
                ["EPSG:3034"],
				["EPSG:3035"],
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
	],
    "proj4jsDefs":{
        "EPSG:26713":"+proj=utm +zone=13 +ellps=clrk66 +datum=NAD27 +units=m +no_defs",
        "EPSG:25832":"+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs",
        "EPSG:32632":"+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "EPSG:2056":"+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs",
        "EPSG:21781":"+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs",
        "EPSG:23031":"+proj=utm +zone=31 +ellps=intl +units=m +no_defs",
        "EPSG:23032":"+proj=utm +zone=32 +ellps=intl +units=m +no_defs",
        "EPSG:2397":"+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=krass +towgs84=24,-123,-94,0.02,-0.25,-0.13,1.1 +units=m +no_defs",
        "EPSG:2398":"+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=krass +towgs84=24,-123,-94,0.02,-0.25,-0.13,1.1 +units=m +no_defs",
        "EPSG:2399":"+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=krass +towgs84=24,-123,-94,0.02,-0.25,-0.13,1.1 +units=m +no_defs",
        "EPSG:25833":"+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs",
        "EPSG:3034":"+proj=lcc +lat_1=35 +lat_2=65 +lat_0=52 +lon_0=10 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +units=m +no_defs",
        "EPSG:3035":"+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs",
        "EPSG:3043":"+proj=utm +zone=31 +ellps=GRS80 +units=m +no_defs",
        "EPSG:3044":"+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs",
        "EPSG:3045":"+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs",
        "EPSG:3068":"+proj=cass +lat_0=52.41864827777778 +lon_0=13.62720366666667 +x_0=40000 +y_0=10000 +ellps=bessel +datum=potsdam +units=m +no_defs",
        "EPSG:31251":"+proj=tmerc +lat_0=0 +lon_0=28 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31252":"+proj=tmerc +lat_0=0 +lon_0=31 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31253":"+proj=tmerc +lat_0=0 +lon_0=34 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31254":"+proj=tmerc +lat_0=0 +lon_0=10.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31255":"+proj=tmerc +lat_0=0 +lon_0=13.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31256":"+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31257":"+proj=tmerc +lat_0=0 +lon_0=10.33333333333333 +k=1 +x_0=150000 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31258":"+proj=tmerc +lat_0=0 +lon_0=13.33333333333333 +k=1 +x_0=450000 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31259":"+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=750000 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31281":"+proj=tmerc +lat_0=0 +lon_0=28 +k=1 +x_0=0 +y_0=0 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31282":"+proj=tmerc +lat_0=0 +lon_0=31 +k=1 +x_0=0 +y_0=0 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31283":"+proj=tmerc +lat_0=0 +lon_0=34 +k=1 +x_0=0 +y_0=0 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31284":"+proj=tmerc +lat_0=0 +lon_0=10.33333333333333 +k=1 +x_0=150000 +y_0=0 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31285":"+proj=tmerc +lat_0=0 +lon_0=13.33333333333333 +k=1 +x_0=450000 +y_0=0 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31286":"+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=750000 +y_0=0 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31287":"+proj=lcc +lat_1=49 +lat_2=46 +lat_0=47.5 +lon_0=13.33333333333333 +x_0=400000 +y_0=400000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs",
        "EPSG:31288":"+proj=tmerc +lat_0=0 +lon_0=28 +k=1 +x_0=150000 +y_0=0 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31289":"+proj=tmerc +lat_0=0 +lon_0=31 +k=1 +x_0=450000 +y_0=0 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31290":"+proj=tmerc +lat_0=0 +lon_0=34 +k=1 +x_0=750000 +y_0=0 +ellps=bessel +pm=ferro +units=m +no_defs",
        "EPSG:31466":"+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs",
        "EPSG:31467":"+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs",
        "EPSG:31468":"+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs",
        "EPSG:31469":"+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs",
        "EPSG:32631":"+proj=utm +zone=31 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "EPSG:32633":"+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "EPSG:32634":"+proj=utm +zone=34 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
        "EPSG:3326":"+proj=tmerc +lat_0=0 +lon_0=28 +k=0.9999 +x_0=500000 +y_0=10000000 +ellps=clrk80 +units=m +no_defs",
        "EPSG:3333":"+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=3500000 +y_0=0 +ellps=krass +towgs84=33.4,-146.6,-76.3,-0.359,-0.053,0.844,-0.84 +units=m +no_defs",
        "EPSG:3396":"+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +units=m +no_defs",
        "EPSG:3397":"+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +units=m +no_defs",
        "EPSG:3399":"+proj=tmerc +lat_0=0 +lon_0=15 +k=1 +x_0=5500000 +y_0=0 +ellps=bessel +units=m +no_defs",
        "EPSG:3416":"+proj=lcc +lat_1=49 +lat_2=46 +lat_0=47.5 +lon_0=13.33333333333333 +x_0=400000 +y_0=400000 +ellps=GRS80 +units=m +no_defs",
        "EPSG:3833":"",
        "EPSG:3834":"",
        "EPSG:3835":"",
        "EPSG:3837":"",
        "EPSG:3838":"",
        "EPSG:4258":"+proj=longlat +ellps=GRS80 +no_defs"
   }
}
