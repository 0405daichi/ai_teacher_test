// app/javascript/packs/application.js
import Rails from "@rails/ujs";
import Turbolinks from "turbolinks";
import * as ActiveStorage from "@rails/activestorage";
import "channels";
import "bootstrap";
import "@popperjs/core";
import "../stylesheets/application";
import "../javascripts/home"
import "../javascripts/icon_event/camera"
import "../javascripts/helpers/cameraFunctions"
import "../javascripts/icon_event/search"
import "../javascripts/icon_event/folder"
import "../javascripts/icon_event/instagram"

Rails.start();
Turbolinks.start();
ActiveStorage.start();

