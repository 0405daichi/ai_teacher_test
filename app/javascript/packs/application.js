// app/javascript/packs/application.js
import Rails from "@rails/ujs";
import Turbolinks from "turbolinks";
import * as ActiveStorage from "@rails/activestorage";
import "channels";
import "bootstrap";
import "@popperjs/core";
import marked from 'marked';
import katex from 'katex';
import "../stylesheets/application";
import "../javascripts/home"
import "../javascripts/icon_event/camera"
import "../javascripts/helpers/optionHandleFunction"
import "../javascripts/helpers/formSubmitFunction"
import "../javascripts/helpers/cameraFunctions"
import "../javascripts/helpers/common_functions"
import "../javascripts/helpers/openApp"
import "../javascripts/icon_event/instagram"
import "../javascripts/icon_event/user"
import "../javascripts/icon_event/ad"

Rails.start();
Turbolinks.start();
ActiveStorage.start();


require("trix")
require("@rails/actiontext")