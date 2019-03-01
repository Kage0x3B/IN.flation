<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    exit();
}

if (!isset($_POST["fileName"])) {
    http_response_code(400);

    exit();
}

if (!isset($_POST["data"])) {
    http_response_code(400);

    exit();
}

$folder = "../../data/";
$uploadPath = $folder . $_POST["fileName"];

file_put_contents($uploadPath, $_POST["data"]);