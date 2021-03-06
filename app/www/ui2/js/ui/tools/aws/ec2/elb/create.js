Scalr.regPage('Scalr.ui.tools.aws.ec2.elb.create', function (loadParams, moduleParams) {
	var form = Ext.create('Ext.form.Panel', {
		title: 'Tools &raquo; Amazon Web Services &raquo; Elastic Load Balancer &raquo; Create',
		fieldDefaults: {
			anchor: '100%'
		},
		scalrOptions: {
			modal: true
		},
		width: 800,
		items: [{
			xtype: 'container',
            cls: 'x-fieldset-separator-bottom',
			layout: {
				type: 'hbox',
				align: 'stretchmax'
			},
			items: [{
				xtype: 'fieldset',
				title: 'Healthcheck',
                cls: 'x-fieldset-separator-none',
				flex: 1,
				//margin: '0 10 10 0',
				defaults: {
					labelWidth: 130
				},
				items: [{
					xtype: 'fieldcontainer',
					layout: 'hbox',
					fieldLabel: 'Healthy Threshold',
					items: [{
						xtype: 'textfield',
						name: 'healthythreshold',
						width: 40
					}, {
						xtype: 'displayinfofield',
						margin: '0 0 0 5',
						info: 'The number of consecutive health probe successes required before moving the instance to the Healthy state.<br />The default is 3 and a valid value lies between 2 and 10.'
					}]
				}, {
					xtype: 'fieldcontainer',
					layout: 'hbox',
					fieldLabel: 'Interval',
					items: [{
						xtype: 'textfield',
						name: 'interval',
						width: 40
					}, {
						xtype: 'displayfield',
						margin: '0 0 0 3',
						value: 'seconds'
					}, {
						xtype: 'displayinfofield',
						margin: '0 0 0 3',
						info:   'The approximate interval (in seconds) between health checks of an individual instance.<br />The default is 30 seconds and a valid interval must be between 5 seconds and 600 seconds.' +
							'Also, the interval value must be greater than the Timeout value'
					}]
				}, {
					xtype: 'fieldcontainer',
					layout: 'hbox',
					fieldLabel: 'Timeout',
					items: [{
						xtype: 'textfield',
						name: 'timeout',
						width: 40
					}, {
						xtype: 'displayfield',
						margin: '0 0 0 3',
						value: 'seconds'
					}, {
						xtype: 'displayinfofield',
						margin: '0 0 0 5',
						info:   'Amount of time (in seconds) during which no response means a failed health probe. <br />The default is five seconds and a valid value must be between 2 seconds and 60 seconds.' +
							'Also, the timeout value must be less than the Interval value.'
					}]
				}, {
					xtype: 'fieldcontainer',
					layout: 'hbox',
					fieldLabel: 'Unhealthy Threshold',
					items: [{
						xtype: 'textfield',
						name: 'unhealthythreshold',
						width: 40
					}, {
						xtype: 'displayinfofield',
						margin: '0 0 0 5',
						info: 'The number of consecutive health probe failures that move the instance to the unhealthy state.<br />The default is 5 and a valid value lies between 2 and 10.'
					}]
				}, {
					xtype: 'fieldcontainer',
					layout: 'hbox',
					fieldLabel: 'Target',
					items: [{
						xtype: 'textfield',
						name: 'target',
						flex: 1
					}, {
						xtype: 'displayinfofield',
						margin: '0 0 0 5',
						info:   'The instance being checked. The protocol is either TCP or HTTP. The range of valid ports is one (1) through 65535.<br />' +
							'Notes: TCP is the default, specified as a TCP: port pair, for example "TCP:5000".' +
							'In this case a healthcheck simply attempts to open a TCP connection to the instance on the specified port.' +
							'Failure to connect within the configured timeout is considered unhealthy.<br />' +
							'For HTTP, the situation is different. HTTP is specified as a "HTTP:port/PathToPing" grouping, for example "HTTP:80/weather/us/wa/seattle". In this case, a HTTP GET request is issued to the instance on the given port and path. Any answer other than "200 OK" within the timeout period is considered unhealthy.<br />' +
							'The total length of the HTTP ping target needs to be 1024 16-bit Unicode characters or less.'
					}]
				}]
			}, {
				xtype: 'fieldset',
				flex: 1,
                cls: 'x-fieldset-separator-left',
				title: 'Availability zones',
				itemId: 'availZones'
			}]

		}, {
            xtype: 'grid',
            itemId: 'listeners',
            cls: 'x-container-fieldset x-grid-shadow x-grid-no-hilighting',
            store: {
                proxy: 'object',
                fields: [ 'protocol', 'lb_port', 'instance_port' , 'ssl_certificate']
            },
            plugins: {
                ptype: 'gridstore'
            },

            viewConfig: {
                emptyText: 'No listeners defined',
                deferEmptyText: false
            },

            columns: [
                { header: 'Protocol', flex: 1, sortable: true, dataIndex: 'protocol' },
                { header: 'Load balancer port', flex: 1, sortable: true, dataIndex: 'lb_port' },
                { header: 'Instance port', flex: 1, sortable: true, dataIndex: 'instance_port' },
                { header: 'SSL certificate', flex: 1, sortable: true, dataIndex: 'ssl_certificate' },
                { header: '&nbsp;', width: 40, sortable: false, dataIndex: 'id', align:'center', xtype: 'templatecolumn',
                    tpl: '<img class="delete" src="/ui2/images/icons/delete_icon_16x16.png">', clickHandler: function (comp, store, record) {
                    store.remove(record);
                }
                }
            ],

            listeners: {
                itemclick: function (view, record, item, index, e) {
                    if (e.getTarget('img.delete'))
                        view.store.remove(record);
                }
            },

            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                ui: 'simple',
                layout: {
                    type: 'hbox',
                    pack: 'start'
                },
                style: 'padding-right:2px',
                items: [{
                    xtype: 'label',
                    cls: 'x-fieldset-subheader',
                    html: 'Listeners',
                    margin: 0
                },{
                    xtype: 'tbfill'
                },{
                    text: 'Add listener',
                    cls: 'x-btn-green-bg',
                    handler: function() {
                        Scalr.Confirm({
                            form: [{
                                xtype: 'container',
                                cls: 'x-container-fieldset',
                                layout: 'anchor',
                                defaults: {
                                    anchor: '100%'
                                },
                                items: [{
                                    xtype: 'combo',
                                    name: 'protocol',
                                    fieldLabel: 'Protocol',
                                    labelWidth: 120,
                                    editable: false,
                                    store: [ 'TCP', 'HTTP', 'SSL', 'HTTPS' ],
                                    queryMode: 'local',
                                    allowBlank: false,
                                    listeners: {
                                        change: function (field, value) {
                                            if (value == 'SSL' || value == 'HTTPS')
                                                this.next('[name="ssl_certificate"]').show().enable();
                                            else
                                                this.next('[name="ssl_certificate"]').hide().disable();
                                        }
                                    }
                                }, {
                                    xtype: 'textfield',
                                    name: 'lb_port',
                                    fieldLabel: 'Load balancer port',
                                    labelWidth: 120,
                                    allowBlank: false,
                                    validator: function (value) {
                                        if (value < 1024 || value > 65535) {
                                            if (value != 80 && value != 443)
                                                return 'Valid LoadBalancer ports are - 80, 443 and 1024 through 65535';
                                        }
                                        return true;
                                    }
                                }, {
                                    xtype: 'textfield',
                                    name: 'instance_port',
                                    fieldLabel: 'Instance port',
                                    labelWidth: 120,
                                    allowBlank: false,
                                    validator: function (value) {
                                        if (value < 1 || value > 65535)
                                            return 'Valid instance ports are one (1) through 65535';
                                        else
                                            return true;
                                    }
                                }, {
                                    xtype: 'combo',
                                    name: 'ssl_certificate',
                                    fieldLabel: 'SSL Certificate',
                                    labelWidth: 120,
                                    hidden: true,
                                    disabled: true,
                                    editable: false,
                                    allowBlank: false,
                                    store: {
                                        fields: [ 'name','path','arn','id','upload_date' ],
                                        proxy: {
                                            type: 'ajax',
                                            reader: {
                                                type: 'json',
                                                root: 'data'
                                            },
                                            url: '/tools/aws/iam/servercertificates/xListCertificates'
                                        },
                                        listeners: {
                                            load: function () {
                                                //console.log(arguments);
                                            }}
                                    },
                                    valueField: 'arn',
                                    displayField: 'name'
                                }]
                            }],
                            ok: 'Add',
                            title: 'Add new listener',
                            formValidate: true,
                            closeOnSuccess: true,
                            scope: this,
                            success: function (formValues) {
                                var view = this.up('#listeners'), store = view.store;

                                if (store.findBy(function (record) {
                                    if (
                                        record.get('protocol') == formValues.protocol &&
                                            record.get('lb_port') == formValues.lb_port &&
                                            record.get('instance_port') == formValues.instance_port
                                        ) {
                                        Scalr.message.Error('Such listener already exists');
                                        return true;
                                    }
                                }) == -1) {
                                    store.add(formValues);
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        });
                    }
                }]
            }]
 		}],

		dockedItems: [{
			xtype: 'container',
			dock: 'bottom',
			cls: 'x-docked-buttons',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [{
				xtype: 'button',
				text: 'Create',
				handler: function() {
					if (form.getForm().isValid()) {
						var listeners = [];
						form.down('#listeners').store.each(function (rec) {
							listeners.push([ rec.get('protocol'), rec.get('lb_port'), rec.get('instance_port'), rec.get('ssl_certificate') ].join("#"));
						});

                        var healthcheck = {
							target: form.down("[name='target']").getValue(),
                            healthyThreshold: form.down("[name='healthythreshold']").getValue(),
                            interval: form.down("[name='interval']").getValue(),
                            timeout: form.down("[name='timeout']").getValue(),
                            unhealthyThreshold: form.down("[name='unhealthythreshold']").getValue()
						};

						Scalr.Request({
							processBox: {
								type: 'save'
							},
							params: {
								listeners: Ext.encode(listeners),
								healthcheck: Ext.encode(healthcheck),
								cloudLocation: loadParams['cloudLocation']
							},
							form: form.getForm(),
							url: '/tools/aws/ec2/elb/xCreate',
							success: function (data) {
								if (data['elb']) {
									Scalr.event.fireEvent('update', '/tools/aws/ec2/elb/create', data['elb']);
								}
								Scalr.event.fireEvent('close');
							}
						});
					}
				}
			}, {
				xtype: 'button',
				text: 'Cancel',
				handler: function() {
					Scalr.event.fireEvent('close');
				}
			}]
		}]
	});

	form.getForm().setValues({
		healthythreshold: 3,
		interval: 30,
		timeout: 5,
		unhealthythreshold: 5
	});

	var avail = form.down('#availZones');
	for (var i = 0; i < moduleParams.zones.length; i++) {
		var n = 'zones[' + moduleParams.zones[i].id + ']';
		avail.add({
			xtype: 'checkbox',
			name: n,
			boxLabel: moduleParams.zones[i].name,
			hideLabel: true
		});
	}

	return form;
});
