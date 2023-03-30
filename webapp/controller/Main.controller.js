sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
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
    function (Controller, MessageToast) {
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
            ordenarFuncion: function (oEvent) {
                var model = this.getView().getModel("Tabla");
                var OrdenarArray = [];
                var inverso = model.oData.length;
                if (this.getView().byId("Descente").getSelected()) {
                    if (orden === 0) {
                        orden = 1;
                        while (inverso > 0) {
                            OrdenarArray.push({ OrderId: model.oData.slice(-1)[0].OrderId, CustomerID: model.oData.slice(-1)[0].CustomerID, EmployeeID: model.oData.slice(-1)[0].EmployeeID, OrderDate: model.oData.slice(-1)[0].OrderDate });
                            model.oData.pop();
                            inverso--
                        }
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(OrdenarArray);
                        this.getView().setModel(Modelo, "Tabla");
                    }
                    else {
                        sap.m.MessageToast.show('El orden actual es el elegido', {
                            duration: 3000,
                            width: "15rem", // default max width supported 
                        });
                    }
                }
                if (this.getView().byId("Ascendete").getSelected()) {
                    if (orden === 1) {

                        while (inverso > 0) {
                            OrdenarArray.push({ OrderId: model.oData.slice(-1)[0].OrderId, CustomerID: model.oData.slice(-1)[0].CustomerID, EmployeeID: model.oData.slice(-1)[0].EmployeeID, OrderDate: model.oData.slice(-1)[0].OrderDate });
                            model.oData.pop();
                            inverso--
                        }
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(OrdenarArray);
                        this.getView().setModel(Modelo, "Tabla");
                    }
                    else {
                        sap.m.MessageToast.show('El orden actual es el elegido', {
                            duration: 3000,
                            width: "15rem", // default max width supported 
                        });
                    }
                }
                else {
                    sap.m.MessageToast.show('Elije una opcion correcta', {
                        duration: 3000,
                        width: "15rem", // default max width supported 
                    });
                }

            },
            // coNTROL DE FECHA,

            displayTable: function (oEvent) {// coNTROL DE FECHA
                var fModel = this.getOwnerComponent().getModel("nData");

                var leaveSince = this.getView().byId("leaveSince").getValue();
                fModel.read("/Orders", {
                    success: function (oData) {
                        var model = oData.results;
                        var array = [];
                        const filtrados = [];
                        Object.values(model).forEach(element => {
                            array.push({
                                ShipName: element.ShipName,
                                CustomerID: element.CustomerID,
                                OrderId: element.OrderID,
                                EmployeeID: element.EmployeeID,
                                OrderDate: element.OrderDate
                            });
                        });
                        const date = new Date(leaveSince);
                        for (var i = 0; i < array.length; i++) {
                            const elemento2 = Date.parse(array[i][0].OrderDate);
                            const date2 = new Date(elemento2);
                            console.log(date2.toLocaleDateString());
                            if (date.toDateString() === date2.toDateString()) {
                                filtrados.push({ OrderId: array[i].OrderId, CustomerID: array[i].CustomerID, EmployeeID: array[i].EmployeeID, OrderDate: date2.toLocaleDateString() });
                            }
                        }
                        var Modelo = new sap.ui.model.json.JSONModel();
                        Modelo.setData(filtrados);
                        this.getView().setModel(Modelo, "Tabla");

                    }.bind(this)
                });

            },
            onOpenDialog: function () {
                // create dialog lazily
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
