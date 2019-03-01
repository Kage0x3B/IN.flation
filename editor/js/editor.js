"use strict";

function DataManager(gameData) {
    this.gameData = gameData;

    const self = this;

    $("#saveButton").on("click", function () {
        self.saveData(dataName + ".json");
    });

    $("#automatedTestButton").on("click", function () {
        const tester = new AutomatedTester(self);
        tester.executeTests();
    });

    $("#previewButton").on("click", function () {
        self.saveData(dataName + "_preview.json", function () {
            const editorUrl = window.location.href;
            const editorPathPart = editorUrl.indexOf("/editor");

            const baseUrl = editorUrl.substring(0, editorPathPart);
            const gamePreviewUrl = baseUrl + "/game.php?data=" + dataName + "_preview";

            const windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=500,height=700,centerscreen=yes,dependent=yes";
            window.open(gamePreviewUrl, "", windowFeatures).focus();
        });
    });

    this.saveData = function (fileName, callback) {
        $.post({
            url: "backend/uploadGameData.php",
            data: {
                fileName: fileName,
                data: JSON.stringify(this.gameData)
            },
            success: callback
        });
    };
}

function ContactEditor(dataManager) {
    this.dataManager = dataManager;
    this.idCounter = 0;

    const self = this;

    this.generateId = function (name) {
        this.idCounter++;

        let id = name + this.idCounter;
        id = id.replaceAll(" ", "_");

        return id;
    };

    this.updateContact = function (id, name, picture) {
        if (id.isEmpty()) {
            if (name.isEmpty()) {
                bootbox.alert("Kontakt wurde nicht gespeichert weil der Name leer war!");

                return;
            }

            id = this.generateId(name);
            dataManager.gameData.contacts[id] = {};
        }

        let contactData = dataManager.gameData.contacts[id];

        contactData.name = name;
        contactData.picture = picture;

        this.updateListHtml();
    };

    this.showEditModal = function (contactId) {
        let contactName = "";
        let contactPicture = "";

        if (!contactId.isEmpty()) {
            const contact = dataManager.gameData.contacts[contactId];

            contactName = contact.name;
            contactPicture = contact.picture;
        }

        $("#contactIdInput").val(contactId);
        $("#contactName").val(contactName);
        $("#contactPicture").val(contactPicture);

        $("#editContactModal").modal("show");
    };

    this.updateListHtml = function () {
        let listHtml = "";

        const contactData = this.dataManager.gameData["contacts"];

        Object.keys(contactData).forEach(function (contactId) {
            const contact = contactData[contactId];

            listHtml += "<li class='list-group-item'>";
            listHtml += contact.name;
            listHtml += "<div class='float-right'>";
            listHtml += "<button type='button' class='btn btn-info mr-2' data-action='editMessages' data-contact='" + contactId + "'>";
            listHtml += "<i class='material-icons md-18'>message</i> <span class='d-none d-sm-none d-md-inline-block'>Nachrichten</span>";
            listHtml += "</button>";
            listHtml += "<button type='button' class='btn btn-warning mr-2' data-action='edit' data-contact='" + contactId + "'>";
            listHtml += "<i class='material-icons md-18'>edit</i> <span class='d-none d-sm-none d-md-inline-block'>Ändern</span>";
            listHtml += "</button>";
            listHtml += "<button type='button' class='btn btn-danger deleteContact' data-action='delete' data-contact='" + contactId + "'>";
            listHtml += "<i class='material-icons md-18'>delete</i> <span class='d-none d-sm-none d-md-inline-block'>Löschen</span>";
            listHtml += "</button>";
            listHtml += "</div>";
            listHtml += "</li>";
        });

        const contactListElement = $("#contactList");
        contactListElement.html(listHtml);
    };

    $("#contactList").on("click", function (event) {
        const target = $(event.target);

        const action = target.data("action");
        const contactId = target.data("contact");

        if (action === "edit") {
            self.showEditModal(contactId);
        } else if (action === "delete") {
            bootbox.confirm({
                message: "Soll der Kontakt wirklich gelöscht werden?",
                buttons: {
                    confirm: {
                        label: 'Ja',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'Abbrechen',
                        className: 'btn-danger'
                    }
                },
                callback: function (result) {
                    if (result) {
                        delete dataManager.gameData.contacts[contactId];
                        self.updateListHtml();
                    }
                }
            });
        } else if (action === "editMessages") {
            const chatEditor = new ChatEditor(dataManager, contactId);
            chatEditor.show();
        } else {
            console.log("Invalid action on " + event.target);
        }
    });

    $("#newContact").on("click", function () {
        self.showEditModal("");
    });
    $("#saveContactChanges").on("click", function () {
        const contactId = $("#contactIdInput").val();
        const contactName = $("#contactName").val();
        const contactPicture = $("#contactPicture").val();

        self.updateContact(contactId, contactName, contactPicture);
        $("#editContactModal").modal("hide");
    });

    this.updateListHtml();
}

function ChatEditor(dataManager, contactId) {
    this.dataManager = dataManager;
    this.contactId = contactId;

    let highestId = -1;
    for (const messageIdString in dataManager.gameData.messages) {
        if (dataManager.gameData.messages.hasOwnProperty(messageIdString)) {
            const messageId = parseInt(messageIdString);

            if (messageId > highestId) {
                highestId = messageId;
            }
        }
    }

    this.idCounter = highestId + 1;

    const self = this;

    this.generateId = function () {
        const id = this.idCounter;
        this.idCounter++;

        return id;
    };

    this.show = function () {
        this.updateListHtml();
        $("#messageEditor").hide();

        const messageListSelector = $("#messageList");
        messageListSelector.off("click");
        messageListSelector.on("click", function (event) {
            const messageId = $(event.target).data("message-id");

            const messageEditor = new MessageEditor(self.dataManager, self, messageId);
            messageEditor.show();
        });

        const addMessageSelector = $("#addMessage");
        addMessageSelector.off("click");
        addMessageSelector.on("click", function () {
            self.editEmptyMessage(contactId);
        });

        const addResponseSelector = $("#addResponse");
        addResponseSelector.off("click");
        addResponseSelector.on("click", function () {
            self.editEmptyMessage("PLAYER");
        });

        $("#chatEditorTabEntry").show();
        $("#messages-tab").tab('show');
    };

    this.editEmptyMessage = function (sender) {
        const messageId = this.generateId();

        dataManager.gameData.messages[messageId] = {
            sender: sender,
            chat: contactId,
            type: "text",
            content: "",
            events: {}
        };
        this.updateListHtml();

        const messageEditor = new MessageEditor(self.dataManager, self, messageId);
        messageEditor.show();
    };

    this.updateListHtml = function () {
        let listHtml = "";

        const messages = this.dataManager.gameData.messages;

        Object.keys(messages).forEach(function (messageId) {
            const message = messages[messageId];

            if (message === undefined) {
                return;
            }

            const chat = message.chat ? message.chat : message.sender;
            if (chat !== contactId) {
                return;
            }

            const itemStyle = message.sender === "PLAYER" ? "info" : "warning";
            listHtml += "<a class='list-group-item list-group-item-action list-group-item-" + itemStyle + "' data-message-id='" + messageId + "'>";
            listHtml += "<strong class='mr-2'>[" + messageId + "]</strong>";
            listHtml += message.content.escapeHTML();
            listHtml += "</a>";
        });

        $("#messageList").html(listHtml);
    };
}


function MessageEditor(dataManager, chatEditor, messageId) {
    this.dataManager = dataManager;
    this.messageData = undefined;

    this.messageSelectIds = [];
    this.sendNextMessageId = -1;
    this.customJSONEvents = "";

    const self = this;

    this.show = function () {
        this.messageData = this.prepareMessageData();

        const saveButtonSelector = $("#saveMessageButton");
        saveButtonSelector.off("click");
        saveButtonSelector.on("click", function () {
            self.saveChanges();
        });

        const deleteButtonSelector = $("#deleteMessageButton");
        deleteButtonSelector.off("click");
        deleteButtonSelector.on("click", function () {
            self.deleteSelf();
        });

        $("#messageId").val(messageId);
        $("#messageTypeSelect").val(this.messageData.type);
        $("#messageContent").val(this.messageData.content);
        $("#answerOptions").val(this.messageSelectIds.join(","));
        $("#nextMessageId").val(this.sendNextMessageId === -1 ? "" : this.sendNextMessageId);
        $("#customEventJSON").val(this.customJSONEvents);

        $("#messageEditor").show();
    };

    this.saveChanges = function () {
        this.messageData.type = $("#messageTypeSelect").val();
        this.messageData.content = $("#messageContent").val();

        const answerOptionsText = $("#answerOptions").val();
        if (!answerOptionsText.isEmpty()) {
            this.messageSelectIds = answerOptionsText.split(",");
        } else {
            this.messageSelectIds = [];
        }

        const nextMessageIdText = $("#nextMessageId").val();
        if (!nextMessageIdText.isEmpty() && !isNaN(parseInt(nextMessageIdText))) {
            this.sendNextMessageId = parseInt(nextMessageIdText);
        } else {
            this.sendNextMessageId = -1;
        }

        this.customJSONEvents = $("#customEventJSON").val();
        dataManager.gameData.messages[messageId] = this.buildMessageData();

        chatEditor.updateListHtml();
    };

    this.deleteSelf = function () {
        bootbox.confirm({
            message: "Soll die Nachricht wirklich gelöscht werden?",
            buttons: {
                confirm: {
                    label: 'Ja',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'Abbrechen',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    delete dataManager.gameData.messages[messageId];
                    chatEditor.updateListHtml();
                    $("#messageEditor").hide();
                }
            }
        });
    };

    this.prepareMessageData = function () {
        let messageData = this.cloneJSONData(dataManager.gameData.messages[messageId]);

        if (!messageData.events) {
            messageData.events = {};
        }

        if (messageData.events.onSend) {
            const onSendEvents = messageData.events.onSend;
            let firstSelectActionIndex = -1;
            let firstSendActionIndex = -1;

            for (let i = 0; i < onSendEvents.length; i++) {
                if (onSendEvents[i].actionType === "showMessageSelect" && firstSelectActionIndex === -1) {
                    firstSelectActionIndex = i;
                } else if (onSendEvents[i].actionType === "sendMessage" && firstSendActionIndex === -1) {
                    firstSendActionIndex = i;
                }
            }

            if (firstSelectActionIndex !== -1 && onSendEvents[firstSelectActionIndex]) {
                this.messageSelectIds = onSendEvents[firstSelectActionIndex].messageIds;
                messageData.events.onSend.splice(firstSelectActionIndex, 1);
                //delete messageData.events.onSend[firstSelectActionIndex];

                if (firstSendActionIndex > firstSelectActionIndex) {
                    firstSendActionIndex--; //We just removed an element before that so every index after it is lowered by 1
                }
            }

            if (firstSendActionIndex !== -1 && onSendEvents[firstSendActionIndex]) {
                this.sendNextMessageId = onSendEvents[firstSendActionIndex].messageId;
                messageData.events.onSend.splice(firstSendActionIndex, 1);
                //delete messageData.events.onSend[firstSendActionIndex];
            }
        }

        this.customJSONEvents = JSON.stringify(messageData.events, null, 2);

        return messageData;
    };

    this.buildMessageData = function () {
        let newMessageData = this.cloneJSONData(this.messageData);

        if (!this.customJSONEvents.isEmpty()) {
            newMessageData.events = JSON.parse(this.customJSONEvents);
        } else if (!newMessageData.events) {
            newMessageData.events = {};
        }

        if (!newMessageData.events.onSend) {
            newMessageData.events.onSend = [];
        }

        if (this.messageSelectIds.length > 0) {
            let messageSelectAction = {
                actionType: "showMessageSelect",
                messageIds: this.messageSelectIds,
                chat: chatEditor.contactId
            };

            newMessageData.events.onSend.push(messageSelectAction);
        }

        if (this.sendNextMessageId >= 0) {
            let sendMessageAction = {
                actionType: "sendMessage",
                messageId: this.sendNextMessageId
            };

            newMessageData.events.onSend.push(sendMessageAction);
        }

        console.log(newMessageData);
        return newMessageData;
    };

    this.cloneJSONData = function (data) {
        return JSON.parse(JSON.stringify(data));
    }
}

function AutomatedTester(messenger) {
    this.createMessageTester = function (testFunction) {
        return function () {
            let result = undefined;

            Object.keys(messenger.gameData.messages).forEach(function (messageId) {
                if (result) {
                    return;
                }

                const messageData = messenger.gameData.messages[messageId];
                result = testFunction(messageId, messageData);
            });

            return result;
        };
    };

    this.tests = [
        this.createMessageTester(function (messageId, messageData) { //Leere Nachrichten
            if (!messageData.content || messageData.content.isEmpty()) {
                return new TestProblemReport("Leere Nachricht.", messageId);
            }
        }),
        this.createMessageTester(function (messageId, messageData) { //Audio Nachricht ohne URL
            if (messageData.type === "audio") {
                if (!(/^[\w\d/\\]+\.mp3$/.test(messageData.content)) && !(/^[\w\d/\\]+\.mp3$/.test(messageData.content.trim()))) {
                    return new TestProblemReport("Audio Nachricht ohne URL/mit falscher URL.", messageId);
                }
            }
        }),
        this.createMessageTester(function (messageId, messageData) { //Problematische Antwort oder Nächste Nachricht
            if (messageData.events && messageData.events.onSend) {
                let firstSelectActionIndex = -1;
                let firstSendActionIndex = -1;

                const onSendEvents = messageData.events.onSend;
                for (let i = 0; i < onSendEvents.length; i++) {
                    if (onSendEvents[i].actionType === "showMessageSelect" && firstSelectActionIndex === -1) {
                        firstSelectActionIndex = i;
                    } else if (onSendEvents[i].actionType === "sendMessage" && firstSendActionIndex === -1) {
                        firstSendActionIndex = i;
                    }
                }

                if (firstSelectActionIndex !== -1) {
                    const selectAction = onSendEvents[firstSelectActionIndex];

                    for (let i = 0; i < selectAction.messageIds.length; i++) {
                        const answerId = selectAction.messageIds[i];

                        if (!messenger.gameData.messages[answerId]) {
                            return new TestProblemReport("Die Antwort \"" + answerId + "\" existiert nicht. (Vielleicht enthält die Nachrichten ID Leerstellen?)", messageId);
                        } else if(messenger.gameData.messages[answerId].sender !== "PLAYER") {
                            return new TestProblemReport("Die Antwort \"" + answerId + "\" ist keine Nachricht vom Spieler.", messageId);
                        }
                    }
                }

                if (firstSendActionIndex !== -1) {
                    const sendAction = onSendEvents[firstSendActionIndex];

                    if (!messenger.gameData.messages[sendAction.messageId]) {
                        return new TestProblemReport("Die nächste Nachricht \"" + sendAction.messageId + "\" existiert nicht. (Vielleicht enthält die Nachrichten ID Leerstellen?)", messageId);
                    }
                }
            }
        })
    ];

    this.executeTests = function () {
        let problemFound = false;

        for (let i = 0; i < this.tests.length; i++) {
            const testResult = this.tests[i]();

            if (testResult) {
                bootbox.alert("Ein Problem wurde gefunden: " + testResult.reportMessage + " (Nachrichten ID: " + testResult.messageId + ")");
                problemFound = true;

                break;
            }
        }

        if (!problemFound) {
            bootbox.alert("Es wurde kein Problem gefunden!");
        }
    };
}

function TestProblemReport(reportMessage, messageId) {
    this.reportMessage = reportMessage;
    this.messageId = messageId;
}

$(function () {
    $("#chatEditorTabEntry").hide();

    const dataFile = "../data/" + dataName + ".json";
    $.getJSON(dataFile, function (gameData) {
        const dataManager = new DataManager(gameData);
        const contactEditor = new ContactEditor(dataManager);
    });

    $('[data-toggle="tooltip"]').tooltip();
});

$(window).on("beforeunload", function () {
    return "Achtung: Ungespeicherte Änderungen gehen beim verlassen/neuladen der Seite verloren!";
});

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.escapeHTML = function () {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};