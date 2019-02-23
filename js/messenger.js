function Messenger(gameData) {
    this.gameData = gameData;
    this.currentScreen = null;

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
    this.buildHtml = function () {
        let html = "";

        if (this.type === "text") {
            html += "<div class='message " + this.direction + "'>";
            html += this.content;
            html += "<span class='metadata'>";
            html += "<span class='time'>" + this.time + "</span>";
            html += "<span class='tick'>";
            html += "<img src='images/ticks.svg' alt=''>";
            html += "</span>";
            html += "</span>";
            html += "</div>";
        }

        return html;
    }
}

function ChatListScreen(messenger) {
    this.messenger = messenger;
    this.domElement = $("#contact-list-screen");

    this.prepareScreen = function () {
        this.domElement.show();
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
    /*hideScreenTemplates();

    $.getJSON("js/game_data.json", function (gameData) {
        const messenger = new Messenger(gameData);

        const chatListScreen = new ChatListScreen(messenger);
        //messenger.changeScreen(chatListScreen);
    });*/
});

function animateMessage(message) {
    setTimeout(function () {
        const tick = message.querySelector('.tick');
        tick.classList.remove('tick-animation');
    }, 500);
}