sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/Sorter',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/IconPool",
    "sap/m/Label",
    "sap/m/library",
    "sap/m/MessageToast",
    "sap/m/Text",
    "sap/m/Dialog",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Sorter, MessageToast) {
        "use strict";
        var orden = 0;
        return Controller.extend("project1.controller.Main", {
            onInit: function () {
                var oModel = this.getOwnerComponent().getModel("nData");
                oModel.read("/Invoices", {
                    success: function (oData, oResponse) {

                        const unicos = [];
                        oData.results.forEach(element => {//Preparacion del array seguramente se pueda hacer en una llamada revisar luego
                            const elemento = element.ShipName;
                            if (!unicos.includes(element.ShipName)) {
                                unicos.push(elemento);
                            }
                        });
                        var valores2 = [];
                        for (var i = 0; i < unicos.length; i++) {// Si lo guardo con Nombre para identificarlo en el otro no me deja compararlo
                            const elemento2 = unicos[i];
                            valores2.push({ Nombre: elemento2 });
                        }
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(valores2);
                        this.getView().setModel(Modelo, "pacoModel");
                    }.bind(this)
                });
                this.getView().byId("helloDialogButton").setEnabled(false);

            },

            onListSelect: function (oEvent) {
                var fModel = this.getOwnerComponent().getModel("nData");
                this.getView().byId("helloDialogButton").setEnabled(true);

                fModel.read("/Orders", {
                    success: function (oData) {
                        var model = oData.results;
                        var selectedItem = this.getView().byId("Nombres").getSelectedItem().getText();
                        var array = [];
                        const filtrados = [];

                        model.forEach(element => {
                            array.push({ ShipName: element.ShipName, EmployeeID: element.EmployeeID });//hechar un ojo
                        });
                        for (var i = 0; i < array.length; i++) {

                            const elemento = array[i].ShipName;
                            if (elemento === selectedItem) {
                                filtrados.push({ Nombre: array[i].EmployeeID });
                            }
                        }
                        var Modelo = new sap.ui.model.json.JSONModel();// Modelo de los otros tontos
                        Modelo.setData(filtrados);
                        this.getView().setModel(Modelo, "filtrados");

                        var arrayO = [];
                        const filtradosO = [];

                        model.forEach(element => {
                            let text = element.OrderID.toString();
                            text.slice(-1);
                            var valor = parseInt(text);
                            if (valor % 2 == 0) {
                                arrayO.push({
                                    ShipName: element.ShipName,
                                    CustomerID: element.CustomerID,
                                    OrderId: element.OrderID,
                                    EmployeeID: element.EmployeeID,
                                    OrderDate: element.OrderDate,
                                    Impar: "sap-icon://decline"
                                });
                            } else {
                                arrayO.push({
                                    ShipName: element.ShipName,
                                    CustomerID: element.CustomerID,
                                    OrderId: element.OrderID,
                                    EmployeeID: element.EmployeeID,
                                    OrderDate: element.OrderDate,
                                    Impar: "sap-icon://accept"

                                });
                            }
                        });
                        for (var i = 0; i < arrayO.length; i++) {
                            const elemento3 = Date.parse(arrayO[i].OrderDate);
                            const date2 = new Date(elemento3);

                            const elemento = arrayO[i].ShipName;
                            if (elemento === selectedItem) {
                                filtradosO.push({ OrderId: arrayO[i].OrderId, CustomerID: arrayO[i].CustomerID, EmployeeID: arrayO[i].EmployeeID, OrderDate: date2.toLocaleDateString(), Impar: arrayO[i].Impar });
                            }
                        }
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(filtradosO);
                        this.getView().setModel(Modelo, "Tabla");

                    }.bind(this)
                });


            },

            onCreateTable: function (oEvent) {
                var fModel = this.getOwnerComponent().getModel("nData");
                fModel.read("/Orders", {
                    success: function (oData, oResponse) {

                        var model = crearModel(oData.results);
                        var selectedItem2 = this.getView().byId("filtrados").getSelectedItem().getText();
                        var selectedItem = this.getView().byId("Nombres").getSelectedItem().getText();

                        var array = [];
                        const filtrados = [];

                        model.forEach(element => {
                            array.push({
                                ShipName: element.ShipName,
                                CustomerID: element.CustomerID,
                                OrderId: element.OrderID,
                                EmployeeID: element.EmployeeID,
                                OrderDate: element.OrderDate
                            });
                        });

                        for (var i = 0; i < array.length; i++) {
                            const elemento3 = Date.parse(array[i].OrderDate);
                            const date2 = new Date(elemento3);
                            const elemento2 = array[i].EmployeeID;
                            if (elemento2 == selectedItem2 && selectedItem === array[i][0].ShipName) {
                                filtrados.push({ OrderId: array[i].OrderId, CustomerID: array[i].CustomerID, EmployeeID: array[i].EmployeeID, OrderDate: date2.toLocaleDateString() });
                            }
                        }

                        console.log(filtrados);
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(filtrados);
                        this.getView().setModel(Modelo, "Tabla");

                    }.bind(this)
                });

            },


            //LLamada de funciones
            handleSortDialogConfirm: function (oEvent) {//Ordenacion con fiori-sapui5
                var oView = this.getView();
                var oTable = oView.byId("table");
                var mParams = oEvent.getParameters();
                var oBinding = oTable.getBinding("items");
                var sPath = mParams.sortItem.getKey();
                var bDescending = mParams.sortDescending;
                var aSorters = [];
                aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
                oBinding.sort(aSorters);

            },

            displayTable: function (oEvent) {// coNTROL DE FECHA
                var fModel = this.getOwnerComponent().getModel("nData");

                var leaveSince = this.getView().byId("leaveSince").getValue();
                fModel.read("/Orders", {
                    success: function (oData) {
                        var datos = oData.results;
                        const filtrados = [];
                        const date = new Date(leaveSince);
                        datos.forEach(element => {
                            const elemento2 = Date.parse(element.OrderDate);
                            const date2 = new Date(elemento2);
                            if (date.toDateString() === date2.toDateString()) {
                                filtrados.push({
                                    ShipName: element.ShipName,
                                    CustomerID: element.CustomerID,
                                    OrderId: element.OrderID,
                                    EmployeeID: element.EmployeeID,
                                    OrderDate: date2.toLocaleDateString()
                                });
                            }
                        });
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(filtrados);
                        this.getView().setModel(Modelo, "Tabla");

                    }.bind(this)
                });

            },
            onOpenDialog: function () {
                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "project1.view.modal"
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },
            onCloseDialog: function () {
                // note: We don't need to chain to the pDialog promise, since this event-handler
                // is only called from within the loaded dialog itself.
                this.byId("Sort").close();
            },

            _errorWhileDataLoading: function (oEvent) {
                console.log("Error handling");
            }
        });


    });
