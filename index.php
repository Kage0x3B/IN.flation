<!doctype html>

<html lang="de">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="description" content="Datenschutzerklärung">
        <meta name="author" content="Moritz Hein">
        <title>IN.flation - Schülerwettbewerb econo=me</title>

        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,700" rel="stylesheet">
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" href="css/startpage.css">
    </head>
    <body class="d-flex flex-column h-100">
        <main role="main" class="flex-shrink-0">
            <form action="game.php">
                <div class="container">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="card bg-light m-5">
                                <div class="card-body">
                                    <h1 class="display-3">IN.flation</h1>
                                    <p class="lead mb-4">Spielerisch Wissen über
                                        <mark>Wirtschaft</mark>
                                        und
                                        <mark>Inflation</mark>
                                        erlangen.
                                    </p>
                                    <hr>
                                    <p class="mt-4">
                                        <strong>IN.flation</strong> ist ein Spiel entwickelt für den Schülerwettbewerb
                                        <em>econo=me</em>.</p>
                                    <p>
                                        Über viele Podcasts, unter anderem auch mit einem Experten auf dem Gebiet, welche durch das Spiel
                                        verteilt sind werden dir Inflation, Deflation und weitere wichtige Vorgänge der Wirtschaft erklärt.<br>
                                        Außerdem kannst du durch durchdachte Entscheidungen dein Wissen in die Tat umsetzen und so
                                        die deutsche Wirtschaft vor einem Zusammenbruch retten.
                                    </p>
                                    <hr>
                                    <h4 class="display-5 mt-4">Einstellungen</h4>
                                    <p>Einstellungen um Probleme mit verschiedenen Geräten zu umgehen.</p>
                                    <div class="form-group">
                                        <div class="custom-control custom-checkbox">
                                            <input id="externalPodcast" type="checkbox" class="custom-control-input" name="externalPodcast">
                                            <label class="custom-control-label" for="externalPodcast">Podcasts über externe App abspielen</label>
                                            <small id="externalPodcastHelp" class="form-text text-muted">
                                                Ankreuzen falls beim Spielen Probleme mit Podcasts auftreten und diese nicht abgespielt werden können.
                                                Fügt einen Knopf hinzu um Podcasts über den Browser oder eine installierte App abzuspielen.
                                            </small>
                                        </div>
                                        <div class="custom-control custom-checkbox">
                                            <input id="onScreenButtonFix" type="checkbox" class="custom-control-input" name="onScreenButtonFix">
                                            <label class="custom-control-label" for="onScreenButtonFix">Spiel anpassen für On-Screen Buttons.</label>
                                            <small id="onScreenButtonFixHelp" class="form-text text-muted">
                                                Ankreuzen wenn das Spiel auf einem Smartphone mit Knöpfen auf dem Bildschirm, die Teile des Spieles verstecken, gespielt wird.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 mt-5">
                            <img src="images/game_preview.png" class="img-fluid" alt="Spiel Vorschaubild">
                            <button id="playButton" type="submit" class="btn btn-success btn-lg btn-block">Spielen!</button>
                        </div>
                    </div>
                </div>
            </form>
        </main>

        <footer class="footer mt-auto py-3">
            <div class="container">
                <a href="legal-notice.php" class="mr-4">Impressum</a>
                <a href="privacy-statement.php">Datenschutzerklärung</a>
            </div>
        </footer>
    </body>
</html>