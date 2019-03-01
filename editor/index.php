<?php
$dataName = "game_data";

if (isset($_GET["data"])) {
    $dataName = $_GET["data"];
}
?>
<!doctype html>

<html lang="de">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700" rel="stylesheet">
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <link href="https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/flatly/bootstrap.min.css" rel="stylesheet" integrity="sha384-T5jhQKMh96HMkXwqVMSjF3CmLcL1nT9//tCqu9By5XSdj7CwR0r+F3LTzUdfkkQf" crossorigin="anonymous">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

        <link rel="stylesheet" type="text/css" href="css/editor.css">

        <title>Messenger Editor</title>
    </head>
    <body>
        <main role="main" class="flex-shrink-0">
            <div class="container">
                <ul class="nav nav-tabs" id="mainTabs" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" id="contact-list-tab" data-toggle="tab" href="#contact-list">Kontakte</a>
                    </li>
                    <li id="chatEditorTabEntry" class="nav-item">
                        <a class="nav-link" id="messages-tab" data-toggle="tab" href="#messages">Chat Nachrichten</a>
                    </li>
                </ul>
                <div class="tab-content" id="main-tabs-content">
                    <div class="tab-pane fade show active" id="contact-list">
                        <?php include "include/contact_list_editor.inc.php"; ?>
                    </div>
                    <div class="tab-pane fade" id="messages">
                        <?php include "include/chat_editor.inc.php"; ?>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            <div class="container">
                <button id="saveButton" type="button" class="btn btn-success">
                    <i class="material-icons md-18">save</i> Speichern
                </button>
                <button id="previewButton" type="button" class="btn btn-success">
                    <i class="material-icons md-18">launch</i> Test öffnen
                </button>
                <button id="automatedTestButton" type="button" class="btn btn-warning">
                    <i class="material-icons md-18">bug_report</i> Fehler Überprüfung durchführen
                </button>
            </div>
        </footer>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js" integrity="sha256-4iQZ6BVL4qNKlQ27TExEhBN1HFPvAvAMbFavKKosSWQ=" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/locale/de.js" integrity="sha256-wUoStqxFxc33Uz7o+njPIobHc4HJjMQqMXNRDy7X3ps=" crossorigin="anonymous"></script>
        <script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.bundle.min.js" integrity="sha384-xrRywqdh3PHs8keKZN+8zzc5TX0GRTLCcmivcbNJWm2rs5C8PRhcEn3czEjhAO9o" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.4.0/bootbox.min.js" integrity="sha256-4F7e4JsAJyLUdpP7Q8Sah866jCOhv72zU5E8lIRER4w=" crossorigin="anonymous"></script>

        <script type="text/javascript">
            const dataName = "<?php echo $dataName; ?>";
        </script>
        <script type="text/javascript" src="js/editor.js"></script>
    </body>
</html>