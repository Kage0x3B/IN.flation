<div class="row mt-2">
    <div id="messageListPanel" class="col-md-4 mt-3 mb-3">
        <div class="mb-3">
            <button id="addMessage" type="button" class="btn btn-warning">
                <i class='material-icons md-18'>add</i>
                <span class='d-none d-sm-none d-md-inline-block'>Nachricht hinzufügen</span>
            </button>
            <button id="addResponse" type="button" class="btn btn-info">
                <i class='material-icons md-18'>add_comment</i>
                <span class='d-none d-sm-none d-md-inline-block'>Antwort hinzufügen</span>
            </button>
        </div>
        <div id="messageListWrapper">
            <div id="messageList" class="list-group"></div>
        </div>
    </div>
    <div id="messageEditor" class="col-md-8">
        <form>
            <div class="form-group row">
                <label for="staticEmail" class="col-sm-2 col-form-label">Nachricht ID</label>
                <div class="col-sm-10">
                    <input type="text" readonly class="form-control-plaintext" id="messageId" value="">
                </div>
            </div>
            <div class="form-group row">
                <label for="messageTypeSelect" class="col-sm-2 col-form-label">Typ</label>
                <div class="col-sm-6">
                    <select class="form-control" id="messageTypeSelect">
                        <option value="text">Text Nachricht</option>
                        <option value="audio">Audio Nachricht</option>
                    </select>
                </div>
            </div>
            <div class="form-group row">
                <label for="messageContent" class="col-sm-2 col-form-label">Inhalt</label>
                <div class="col-sm-10">
                    <textarea class="form-control" id="messageContent" rows="5"></textarea>
                </div>
            </div>
            <hr>
            <div id="answerOptionsContainer" class="form-group row" data-toggle="tooltip" data-placement="top" title="Eine Liste von IDs, abgetrennt durch ein Komma. Leerlassen für keine Antworten auf diese Nachricht.">
                <label for="answerOptions" class="col-sm-2 col-form-label">Antwort Optionen</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="answerOptions" placeholder="0,1,2 ...">
                </div>
            </div>
            <div id="eventContainer" class="form-group row" data-toggle="tooltip" data-placement="top" title="ID von der Nachricht die direkt hier nach gesendet werden soll. Leerlassen für keine.">
                <label for="nextMessageId" class="col-sm-2 col-form-label">Nächste Nachricht ID</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="nextMessageId">
                </div>
            </div>
            <hr>
            <div class="form-group row">
                <label for="customEventJSON" class="col-sm-2 col-form-label">Eigenes Event JSON</label>
                <div class="col-sm-10">
                    <textarea class="form-control" id="customEventJSON" rows="8"></textarea>
                </div>
            </div>
            <button id="saveMessageButton" type="button" class="btn btn-success">Änderungen übernehmen</button>
            <button id="deleteMessageButton" type="button" class="btn btn-danger">Nachricht löschen</button>
        </form>
    </div>
</div>