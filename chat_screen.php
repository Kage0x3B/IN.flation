<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.1.2/css/material-design-iconic-font.min.css" rel="stylesheet">
        <link href="https://rawgit.com/marvelapp/devices.css/master/assets/devices.min.css" rel="stylesheet">

        <link rel="stylesheet" type="text/css" href="css/messenger.css">

        <title>Messenger</title>
    </head>
    <body>
        <div class="page">
            <div class="marvel-device nexus5">
                <div class="top-bar"></div>
                <div class="sleep"></div>
                <div class="volume"></div>
                <div class="camera"></div>
                <div class="screen">
                    <div class="screen-container">
                        <div class="status-bar">
                            <div id="device-time" class="time"></div>
                            <div class="battery">
                                <i class="zmdi zmdi-battery"></i>
                            </div>
                            <div class="network">
                                <i class="zmdi zmdi-network"></i>
                            </div>
                            <div class="wifi">
                                <i class="zmdi zmdi-wifi-alt-2"></i>
                            </div>
                            <div class="star">
                                <i class="zmdi zmdi-star"></i>
                            </div>
                        </div>

                        <?php require "include/chat.inc.php" ?>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js" integrity="sha256-4iQZ6BVL4qNKlQ27TExEhBN1HFPvAvAMbFavKKosSWQ=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/locale/de.js" integrity="sha256-wUoStqxFxc33Uz7o+njPIobHc4HJjMQqMXNRDy7X3ps=" crossorigin="anonymous"></script>
        <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>

        <script type="text/javascript" src="js/messenger.js"></script>
    </body>
</html>