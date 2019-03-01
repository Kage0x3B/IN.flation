<ul id="contactList" class="list-group">

</ul>

<button id="newContact" type="button" class="btn btn-success m-3">Neuer Kontakt</button>

<div class="modal fade" id="editContactModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 id="edit" class="modal-title">Kontakt bearbeiten</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form>
                    <input type="hidden" id="contactIdInput">
                    <div class="form-group row">
                        <label for="contactName" class="col-sm-2 col-form-label">Name</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="contactName">
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="contactPicture" class="col-sm-2 col-form-label">Profilbild</label>
                        <div class="col-sm-10">
                            <input type="text" class="form-control" id="contactPicture">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button id="saveContactChanges" type="button" class="btn btn-success">Änderungen übernehmen</button>
            </div>
        </div>
    </div>
</div>