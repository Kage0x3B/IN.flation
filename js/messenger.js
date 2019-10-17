function Messenger(gameData) {
    this.gameData = gameData;
    this.currentScreen = null;
    this.dataManager = new DataManager(this);
    this.notificationSound = new Audio("sounds/plucky.mp3");
    this.audioManager = new AudioManager(this);
    this.virtualEconomy = new VirtualEconomy(this);
    this.virtualEconomy.economyNewsletter.loadNewsletterData();

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

    this.sendCustomMessage = function (chat, type, messageContent) {
        const messageId = this.dataManager.createCustomMessage(chat, type, messageContent);
        this.sendMessage(messageId);
    };

    this.sendMessage = function (messageId) {
        const messageData = this.dataManager.getMessage(messageId);

        const timeout = messageData.direction === "received" ? Math.random() * 1500 + 500 : 0;
        window.setTimeout(function () {
            const isCurrentChat = self.currentScreen instanceof ChatScreen && self.currentScreen.contactId === messageData.chat;
            self.dataManager.markSend(messageId, !isCurrentChat);

            if (isCurrentChat) {
                self.currentScreen.appendMessage(messageId);

                const conversationContainerSelector = $("#conversation-container");
                conversationContainerSelector.animate({scrollTop: conversationContainerSelector.prop("scrollHeight")}, 500);

                if (messageData.direction === "sent") {
                    self.currentScreen.animateMessage(messageId);
                }
            } else if (messageData.direction === "received") {
                self.notificationSound.play();

                if (window.navigator.vibrate) {
                    window.navigator.vibrate(200);
                }
            }

            if (self.currentScreen instanceof ContactListScreen) {
                self.currentScreen.updateContactList();
            }

            if (messageData.events && "onSend" in messageData.events) {
                messageData.events["onSend"].forEach(function (actionData) {
                    self.executeAction(actionData);
                });
            }
        }, timeout);
    };

    this.showMessageSelect = function (messageIds, chat) {
        const isCurrentChat = this.currentScreen instanceof ChatScreen && this.currentScreen.contactId === chat;

        this.dataManager.setMessageChoices(chat, messageIds);
        if (isCurrentChat) {
            const messageChoices = this.dataManager.getMessageChoices(chat);
            this.currentScreen.showMessageChoices(messageChoices);
        }
    };

    this.executeAction = function (actionData) {
        const type = actionData.actionType;

        const typeStart = type.substring(0, 3);

        if (type === "sendMessage") {
            this.sendMessage(actionData.messageId);
        } else if (type === "sendMessageCondition") {
            const messages = actionData.messages;
            let messageId;

            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];

                const infRate = this.virtualEconomy.inflationRate;
                if (eval(message.condition)) {
                    messageId = message.messageId;

                    break;
                }
            }

            if (messageId) {
                this.sendMessage(messageId);
            }
        } else if (type === "showMessageSelect") {
            this.showMessageSelect(actionData.messageIds, actionData.chat);
        } else if (typeStart === "ve:") {
            this.virtualEconomy.processAction(actionData);
        } else {
            console.log("Invalid action type! Action data:");
            console.log(actionData);
        }
    };

    this.audioManager.preloadAudio();

    this.gameData["initialActions"].forEach(function (actionData) {
        self.executeAction(actionData);
    });
    this.gameData["loadActions"].forEach(function (actionData) {
        self.executeAction(actionData);
    });
}

function DataManager(messenger) {
    this.saveData = {
        contacts: {},
        sendTime: {},
        messageSelect: {},
        customMessages: {},
        customMessageCounter: 0
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

    this.createCustomMessage = function (sender, type, messageContent) {
        const messageId = "custom-" + (this.saveData.customMessageCounter++);

        this.saveData.customMessages[messageId] = {
            sender: sender,
            chat: sender,
            type: type,
            content: messageContent
        };

        return messageId;
    };

    this.getMessage = function (messageId) {
        let messageData;
        let messageIdString = String(messageId).trim();

        if (messageIdString.startsWith("custom-")) {
            messageData = this.saveData.customMessages[messageIdString];
        } else {
            messageData = messenger.gameData.messages[messageIdString];
        }

        if (!messageData) {
            console.log("No message with id " + messageId + "!");

            return JSON.parse(JSON.stringify(this.emptyMessage));
        }

        messageData.messageId = messageIdString;

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
            const message = self.getMessage(messageId);

            messageChoices.push(message);
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

function AudioManager(messenger) {
    this.loadedAudio = {};

    const self = this;

    this.preloadAudio = function () {
        /*console.log("Loading audio...");
        Object.keys(messenger.gameData.messages).forEach(function (key) {
            const messageData = messenger.gameData.messages[key];

            if (messageData.type === "audio") {
                const audioUrl = "audio/" + messageData.content;

                const audio = new Audio(audioUrl);
                audio.preload = "auto";
                self.loadedAudio[messageData.content] = audio;

                console.log("Loading " + audioUrl + " (message: " + key + ")");
            }
        });*/
    };
}

function VirtualEconomy(messenger) {
    this.inflationRate = 0;
    this.economyNewsletter = new EconomyNewsletter(messenger, this);

    this.processAction = function (actionData) {
        const actionType = actionData.actionType;

        switch (actionType) {
            case "ve:eval":
                let infRate = this.inflationRate;
                eval(actionData.script);
                this.inflationRate = infRate;
                console.log("Inflationsrate: " + this.inflationRate);
                break;
            case "ve:triggerNewsletter":
                const newsletterChat = actionData.chat;
                this.economyNewsletter.sendNewsletter(newsletterChat);
                break;
        }
    };
}

function EconomyNewsletter(messenger, virtualEconomy) {
    this.newsletterData = {
        newsletters: [
            {
                condition: "true",
                message: "Die Inflationsrate ist bei {infRatePercent}."
            }
        ]
    };

    const self = this;

    this.loadNewsletterData = function () {
        $.ajax({
            dataType: "json",
            cache: false,
            url: "data/newsletterData.json"
        }).done(function (newsletterData) {
            self.newsletterData = newsletterData;
        }).fail(function () {
            console.log("Unable to load newsletter data!");
        });
    };

    this.sendNewsletter = function (chat) {
        const infRate = virtualEconomy.inflationRate;
        const infRatePercent = this.formatFloat(infRate) + "%";
        const defRatePercent = this.formatFloat(-infRate) + "%";

        const possibleNewsletters = [];

        if (this.newsletterData) {
            const newsletters = this.newsletterData.newsletters;

            for (let i = 0; i < newsletters.length; i++) {
                const newsletter = newsletters[i];

                if (eval(newsletter.condition)) {
                    possibleNewsletters.push(newsletter.message);
                }
            }
        }

        let newsletterContent = "Die Inflationsrate ist bei " + infRatePercent + ".";

        if (possibleNewsletters.length > 0) {
            newsletterContent = possibleNewsletters[Math.floor(Math.random() * possibleNewsletters.length)];

            if (newsletterContent.startsWith("eval:")) {
                newsletterContent = newsletterContent.substring(5);
                newsletterContent = eval(newsletterContent);
            }

            newsletterContent = newsletterContent.replace("{infRate}", infRate);
            newsletterContent = newsletterContent.replace("{defRate}", String(-infRate));
            newsletterContent = newsletterContent.replace("{infRatePercent}", infRatePercent);
            newsletterContent = newsletterContent.replace("{defRatePercent}", defRatePercent);
        }

        messenger.sendCustomMessage(chat, "text", newsletterContent);
    };

    this.formatFloat = function (num) {
        return Number.parseFloat(num.toFixed(1)).toPrecision(1);
    };
}

function ContactListScreen(messenger) {
    this.messenger = messenger;
    this.domElement = $("#contact-list-screen");

    this.prepareScreen = function () {
        this.updateContactList();
    };

    this.updateContactList = function () {
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

        const lastMessage = this.messenger.dataManager.getLastMessage(contactId);

        if (lastMessage.content.isEmpty()) { //Don't display empty chats
            return "";
        }

        //const messagePreview = lastMessage.content.isEmpty() ? "" : lastMessage.senderDisplayname + ": " + lastMessage.content;
        let messagePreview = lastMessage.content;

        if (lastMessage.type === "audio") {
            messagePreview = "<i class='zmdi zmdi-volume-up'></i> Audio";
        }

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
        let self = this;

        const conversationContainerSelector = $("#conversation-container");
        conversationContainerSelector.html("");

        const contactData = this.messenger.gameData["contacts"][contactId];
        $("#contact-avatar").attr("src", "images/avatar/" + contactData.picture);
        $("#contact-name").text(contactData.name);

        const messageHistory = this.messenger.dataManager.getMessageHistory(this.contactId);

        messageHistory.forEach(function (messageId) {
            self.appendMessage(messageId);
        });

        const messageChoices = this.messenger.dataManager.getMessageChoices(this.contactId);

        if (messageChoices !== undefined) {
            this.showMessageChoices(messageChoices);
        } else {
            this.hideMessageChoices();
        }

        const backArrowSelector = $("#back-arrow");
        backArrowSelector.off("click");
        backArrowSelector.on("click", function () {
            self.messenger.changeScreen(new ContactListScreen(self.messenger));
        });

        const prevMessageChoiceSelector = $("#prev-message-choice");
        prevMessageChoiceSelector.off("click");
        prevMessageChoiceSelector.on("click", function () {
            self.selectedMessage -= 1;

            if (self.selectedMessage < 0) {
                self.selectedMessage = self.messageChoices.length - 1;
            }

            self.updateMessageChoices();
        });

        const nextMessageChoiceSelector = $("#next-message-choice");
        nextMessageChoiceSelector.off("click");
        nextMessageChoiceSelector.on("click", function () {
            self.selectedMessage += 1;

            if (self.selectedMessage >= self.messageChoices.length) {
                self.selectedMessage = 0;
            }

            self.updateMessageChoices();
        });


        const sendButtonSelector = $("#send-button");
        sendButtonSelector.off("click");
        sendButtonSelector.on("click", function () {
            if (self.selectedMessage === -1) {
                return;
            }

            const message = self.messageChoices[self.selectedMessage];

            self.hideMessageChoices();
            self.messenger.dataManager.unsetMessageChoices(self.contactId);

            self.messenger.sendMessage(message.messageId);
        });

        //conversationContainerSelector.scrollTop(conversationContainerSelector.prop("scrollHeight"));
        conversationContainerSelector.animate({scrollTop: conversationContainerSelector.prop("scrollHeight")}, 10);
    };

    this.appendMessage = function (messageId) {
        const message = this.messenger.dataManager.getMessage(messageId);
        const containerId = "message-" + messageId;

        this.appendMessageHtml(containerId, message);
    };

    this.appendMessageHtml = function (containerId, message) {
        let messageHtml = "";
        let audioMessage;

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
            case "audio":
                audioMessage = new AudioMessage(messenger, message);

                messageHtml += "<div id='" + containerId + "' class='message received'>";
                messageHtml += audioMessage.buildHtml();
                messageHtml += "<span class='metadata'>";
                messageHtml += "<span class='time'>" + message.time + "</span>";

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

        if (audioMessage) {
            audioMessage.initEvents();
        }
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

        const messageSelectSelector = $("#message-select");
        if (messageChoices.length > 1) {
            messageSelectSelector.show();
        } else {
            messageSelectSelector.hide();
        }

        this.updateMessageChoices();
    };

    this.hideMessageChoices = function () {
        this.messageChoices = undefined;
        this.selectedMessage = -1;

        $("#message-select").hide();
        $("#message-text-box").html("...");
    };

    this.updateMessageChoices = function () {
        let activeMessage = this.messageChoices[this.selectedMessage];

        $("#message-text-box").html(activeMessage.content);

        for (let i = 0; i < this.messageChoices.length; i++) {
            $("#index-dot-" + i).removeClass("active");
        }

        $("#index-dot-" + this.selectedMessage).addClass("active");
    };
}

//TODO: Hacky, fix later! jQuery on("click", ..) didn't work?!
function toggleAudio(audioId) {
    const audio = document.getElementById(audioId + "-ae");

    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }

    const iconSelector = $("#" + audioId + "-icon");
    console.log(iconSelector);
    iconSelector.removeClass("zmdi-play-circle-outline");
    iconSelector.removeClass("zmdi-pause-circle-outline");
    iconSelector.addClass(audio.paused ? "zmdi-play-circle-outline" : "zmdi-pause-circle-outline");
}

function AudioMessage(messenger, messageData) {
    this.audioId = "audio-" + messageData.messageId;
    this.audioUrl = "audio/" + messageData.content;

    const self = this;

    this.buildHtml = function () {
        let audioHtml = "";

        audioHtml += "<audio id='" + this.audioId + "-ae' preload='auto'>";
        audioHtml += "<source src='" + this.audioUrl + "' type='audio/mpeg'>";
        audioHtml += "<strong>Der Browser unterstützt keine Audio Wiedergabe.</strong>";
        audioHtml += "</audio>";
        audioHtml += "<div id='" + this.audioId + "-play' onclick='toggleAudio(\"" + this.audioId + "\")' class='play-button'>";
        audioHtml += "<i id='" + this.audioId + "-icon' class='zmdi zmdi-play-circle-outline zmdi-hc-3x'></i>";
        audioHtml += "</div>";

        if (externalPodcast) {
            audioHtml += "<a href='" + this.audioUrl + "' target='_blank' class='external-podcast'>";
            audioHtml += "<i class='zmdi zmdi-open-in-new zmdi-hc-2x'></i>";
            audioHtml += "</a>";
        }

        return audioHtml;
    };

    this.initEvents = function () {
        /*const buttonSelector = $("#" + this.audioId + "-play");
        buttonSelector.on("click", function () {
            const audioElementSelector = $("#" + self.audioId + "-ae");
            const audio = audioElementSelector.get();
            console.log(audio);
            console.log(audio.paused);

            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }

            const iconSelector = buttonSelector.find("i");
            iconSelector.removeClass(self.audio.paused ? "zmdi-pause-circle-outline" : "zmdi-play-circle-outline");
            iconSelector.addClass(self.audio.paused ? "zmdi-play-circle-outline" : "zmdi-pause-circle-outline");
        });*/
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

let messenger = undefined; //TODO: For debugging purposes

$(function () {
    updateDeviceTime();
    hideScreenTemplates();

    const dataFile = "data/" + dataName + ".json";

    $.ajax({
        dataType: "json",
        cache: false,
        url: dataFile
    }).done(function (gameData) {
        messenger = new Messenger(gameData);

        const chatListScreen = new ContactListScreen(messenger);
        messenger.changeScreen(chatListScreen);
    }).fail(function () {
        alert("Unable to load game data!");
    });

    if (window.navigator.vibrate) {
        window.navigator.vibrate(0);
    }
});

String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
};