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
 * @requires plugins/Tool.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = DownloadToolAction
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: DownloadToolAction(config)
 *
 */
gxp.plugins.DownloadToolAction = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_downloadtoolaction */
    ptype: "gxp_downloadtoolaction",
	
	downloadTool: "download",
    
    /** api: method[addActions]
     */
    addActions: function() {
        var selectedLayer;
        this.downloadTool = this.target.tools[this.downloadTool];
		
        var actions = gxp.plugins.GeonetworkSearch.superclass.addActions.apply(this, [{
            menuText: "Download Tool",
            icon :'theme/app/img/download.png',
            disabled: true,
            tooltip: this.downloadToolActionTip,
            handler: function() {
                var record = selectedLayer;
                if(record) {				
					
					//var westPanel = Ext.getCmp("west");
					//westPanel.setActiveTab(2);
					
					this.downloadTool.setLayer(record);
                }
            },
            scope: this
        }]);
        
        var downloadToolAction = actions[0];

        this.target.on("layerselectionchange", function(record) {
            selectedLayer = record.get('group') === 'background' ? null : (record.get('name') ? record : null);
            downloadToolAction.setDisabled(
                 !selectedLayer || this.target.mapPanel.layers.getCount() <= 1 || !record
            );
        }, this);
        
        var enforceOne = function(store) {
            downloadToolAction.setDisabled(
                !selectedLayer || store.getCount() <= 1
            );
        }
        
        this.target.mapPanel.layers.on({
            "add": enforceOne,
            "remove": function(store){
                downloadToolAction.setDisabled(true);
            }
        });
        
        return actions;
    }        
});

Ext.preg(gxp.plugins.DownloadToolAction.prototype.ptype, gxp.plugins.DownloadToolAction);
