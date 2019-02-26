function Messenger(gameData) {
    this.gameData = gameData;
    this.currentScreen = null;
    this.gameStateManager = new GameStateManager(this);

    const self = this;

    this.changeScreen = function (newScreen) {
        if (this.currentScreen != null) {
            this.currentScreen.domElement.hide();
        }

        newScreen.prepareScreen();
        this.currentScreen = newScreen;

        if (this.currentScreen != null) {
            this.currentScreen.domElement.show();
        }
    };

    this.sendMessage = function (messageId) {
        const messageData = this.gameStateManager.getMessage(messageId);
        const isCurrentChat = this.currentScreen instanceof ChatScreen && this.currentScreen.contactId === messageData.chat;
        this.gameStateManager.markSend(messageId, !isCurrentChat);

        if (isCurrentChat) {
            this.currentScreen.appendMessage(messageId);

            if (messageData.direction === "sent") {
                this.currentScreen.animateMessage(messageId);
            }
        }

        if ("onSend" in messageData.events) {
            messageData.events["onSend"].forEach(function (actionData) {
                self.executeAction(actionData);
            });
        }
    };

    this.showMessageSelect = function (messageIds, chat) {
        const isCurrentChat = this.currentScreen instanceof ChatScreen && this.currentScreen.contactId === chat;

        this.gameStateManager.setMessageChoices(chat, messageIds);
        if (isCurrentChat) {
            const messageChoices = this.gameStateManager.getMessageChoices(chat);
            this.currentScreen.showMessageChoices(messageChoices);
        }
    };

    this.executeAction = function (actionData) {
        console.log(actionData);
        switch (actionData.actionType) {
            case "sendMessage":
                this.sendMessage(actionData.messageId);
                break;
            case "showMessageSelect":
                this.showMessageSelect(actionData.messageIds, actionData.chat);
                break;
            default:
                console.log("Invalid action type! Action data:");
                console.log(actionData);
                break;
        }
    };

    this.gameData["initialActions"].forEach(function (actionData) {
        self.executeAction(actionData);
    });
    this.gameData["loadActions"].forEach(function (actionData) {
        self.executeAction(actionData);
    });
}

function GameStateManager(messenger) {
    this.saveData = {
        contacts: {},
        sendTime: {},
        messageSelect: {}
    };

    const self = this;
    Object.keys(messenger.gameData["contacts"]).forEach(function (key) {
        self.saveData.contacts[key] = {
            sentMessages: [],
            newMessageAmount: 0
        };

        self.saveData.messageSelect[key] = [];
    });

    this.emptyMessage = {
        sender: "",
        type: "text",
        content: "",
        time: "",
        direction: "received",
        events: {}
    };

    this.getMessage = function (messageId) {
        const messageData = messenger.gameData.messages[messageId];

        messageData.messageId = messageId;

        if (messageData.sender === "PLAYER") {
            messageData.senderDisplayname = "Du";
            messageData.direction = "sent";
        } else {
            messageData.chat = messageData.sender;
            messageData.senderDisplayname = messageData.sender;
            messageData.direction = "received";
        }

        messageData.time = this.getMessageTime(messageId);

        return messageData;
    };

    this.getMessageHistory = function (contactId) {
        return this.saveData.contacts[contactId].sentMessages;
    };

    this.getLastMessage = function (contactId) {
        const sentMessages = this.saveData.contacts[contactId].sentMessages;

        if (sentMessages.length === 0) {
            return this.emptyMessage;
        } else {
            return this.getMessage(sentMessages[sentMessages.length - 1]);
        }
    };

    this.getMessageTime = function (messageId) {
        if (messageId in this.saveData.sendTime) {
            return this.saveData.sendTime[messageId];
        } else {
            return this.getCurrentTime();
        }
    };

    this.getCurrentTime = function () {
        return moment().format("hh:mm");
    };

    this.getMessageChoices = function (contactId) {
        if (this.saveData.messageSelect[contactId].length === 0) {
            return undefined;
        }

        const messageChoices = [];

        const self = this;
        this.saveData.messageSelect[contactId].forEach(function (messageId) {
            messageChoices.push(self.getMessage(messageId));
        });

        return messageChoices;
    };

    this.markSend = function (messageId, markNew) {
        if (!(messageId in this.saveData.sendTime)) {
            const messageData = this.getMessage(messageId);

            this.saveData.sendTime[messageId] = this.getCurrentTime();
            this.saveData.contacts[messageData.chat].sentMessages.push(messageId);

            if (markNew) {
                this.saveData.contacts[messageData.chat].newMessageAmount += 1;
            }
        }
    };

    this.setMessageChoices = function (contactId, messageIds) {
        this.saveData.messageSelect[contactId] = messageIds;
    };

    this.unsetMessageChoices = function (contactId) {
        this.saveData.messageSelect[contactId] = [];
    };
}

function ContactListScreen(messenger) {
    this.messenger = messenger;
    this.domElement = $("#contact-list-screen");

    this.prepareScreen = function () {
        const contactData = this.messenger.gameData["contacts"];

        let contactListHtml = "";

        const self = this;
        Object.keys(contactData).forEach(function (key) {
            contactListHtml += self.buildContactHtml(key, contactData[key]);
        });

        const contactListElement = $("#contact-list");
        contactListElement.html(contactListHtml);

        Object.keys(contactData).forEach(function (key) {
            $("#" + key).on("click", function () {
                self.messenger.changeScreen(new ChatScreen(self.messenger, key));
            });
        });
    };

    this.buildContactHtml = function (contactId, contactData) {
        let html = "";

        const lastMessage = this.messenger.gameStateManager.getLastMessage(contactId);
        //const messagePreview = lastMessage.content.isEmpty() ? "" : lastMessage.senderDisplayname + ": " + lastMessage.content;
        const messagePreview = lastMessage.content;

        html += "<div id='" + contactId + "' class='contact'>";
        html += "<div class='avatar'>";
        html += "<img src='images/avatar/" + contactData.picture + "' alt='" + contactData.name + "'>";
        html += "</div>";
        html += "<div class='information'>";
        html += "<div class='time'>" + lastMessage.time + "</div>";
        html += "<div class='name'>" + contactData.name + "</div>";
        html += "<div class='message-preview'>" + messagePreview + "</div>";
        html += "</div>";
        html += "</div>";

        return html;
    };
}

function ChatScreen(messenger, contactId) {
    this.messenger = messenger;
    this.domElement = $("#chat-screen");
    this.contactId = contactId;

    this.messageChoices = undefined;
    this.selectedMessage = -1;

    this.prepareScreen = function () {
        const self = this;

        $("#conversation-container").html("");

        const contactData = this.messenger.gameData["contacts"][contactId];
        $("#contact-avatar").attr("src", "images/avatar/" + contactData.picture);
        $("#contact-name").text(contactData.name);

        const messageHistory = this.messenger.gameStateManager.getMessageHistory(this.contactId);

        messageHistory.forEach(function (messageId) {
            self.appendMessage(messageId);
        });

        $("#back-arrow").on("click", function () {
            self.messenger.changeScreen(new ContactListScreen(self.messenger));
        });

        const messageChoices = this.messenger.gameStateManager.getMessageChoices(this.contactId);

        if (messageChoices !== undefined) {
            this.showMessageChoices(messageChoices);
        } else {
            this.hideMessageChoices();
        }

        $("#prev-message-choice").on("click", function () {
            self.selectedMessage -= 1;

            if (self.selectedMessage < 0) {
                self.selectedMessage = self.messageChoices.length - 1;
            }

            self.updateMessageChoices();
        });

        $("#next-message-choice").on("click", function () {
            self.selectedMessage += 1;

            if (self.selectedMessage >= self.messageChoices.length) {
                self.selectedMessage = 0;
            }

            self.updateMessageChoices();
        });

        $("#send-button").on("click", function () {
            if (self.selectedMessage === -1) {
                return;
            }

            const message = self.messageChoices[self.selectedMessage];

            self.hideMessageChoices();
            self.messenger.gameStateManager.unsetMessageChoices(self.contactId);

            self.messenger.sendMessage(message.messageId);
        });
    };

    this.appendMessage = function (messageId) {
        const message = this.messenger.gameStateManager.getMessage(messageId);
        const containerId = "message-" + messageId;

        this.appendMessageHtml(containerId, message);

        switch (message.type) {
            case "text": //Nothing special needs to happen for normal text messages. Use this later for audio messages etc.
                break;
            //Default error already handled in appendMessageHtml
        }
    };

    this.appendMessageHtml = function (containerId, message) {
        let messageHtml = "";

        switch (message.type) {
            case "text":
                messageHtml += "<div id='" + containerId + "' class='message " + message.direction + "'>";
                messageHtml += message.content;
                messageHtml += "<span class='metadata'>";
                messageHtml += "<span class='time'>" + message.time + "</span>";

                if (message.direction === "sent") {
                    messageHtml += "<span class='tick'>";
                    messageHtml += "<img src='images/ticks.svg' alt=''>";
                    messageHtml += "</span>";
                }

                messageHtml += "</span>";
                messageHtml += "</div>";
                break;
            default:
                console.log("Invalid message type! Message:");
                console.log(message);
                break;
        }
        const conversationContainerElement = $("#conversation-container");
        let currentHtml = conversationContainerElement.html();
        conversationContainerElement.html(currentHtml + messageHtml);
    };

    this.animateMessage = function (messageId) {
        const containerId = "message-" + messageId;
        const tickElement = $(containerId + " > img");
        //tickElement.addClass("tick-animation");

        setTimeout(function () {
            //tickElement.removeClass("tick-animation");
        }, 500);
    };

    this.showMessageChoices = function (messageChoices) {
        this.messageChoices = messageChoices;
        this.selectedMessage = 0;

        let indexDotsHtml = "";
        for (let i = 0; i < messageChoices.length; i++) {
            indexDotsHtml += "<span id='index-dot-" + i + "' class='dot'></span>";
        }
        $("#select-index-dots").html(indexDotsHtml);

        $("#message-select").show();
        this.updateMessageChoices();
    };

    this.hideMessageChoices = function () {
        this.messageChoices = undefined;
        this.selectedMessage = -1;

        $("#message-select").hide();
        $("#message-text-box").val("");
    };

    this.updateMessageChoices = function () {
        let activeMessage = this.messageChoices[this.selectedMessage];

        $("#message-text-box").val(activeMessage.content);

        for (let i = 0; i < this.messageChoices.length; i++) {
            $("#index-dot-" + i).removeClass("active");
        }

        $("#index-dot-" + this.selectedMessage).addClass("active");
    };
}

function hideScreenTemplates() {
    $("#contact-list-screen").hide();
    $("#chat-screen").hide();
}

function updateDeviceTime() {
    const deviceTime = $('#device-time');
    deviceTime.text(moment().format('HH:mm'));
    setInterval(function () {
        deviceTime.text(moment().format('HH:mm'));
    }, 1000);
}

$(function () {
    updateDeviceTime();
    hideScreenTemplates();

    $.getJSON("data/game_data.json", function (gameData) {
        const messenger = new Messenger(gameData);

        const chatListScreen = new ContactListScreen(messenger);
        //messenger.changeScreen(chatListScreen);
        messenger.changeScreen(new ChatScreen(messenger, "Moritz"));
    });
});

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};