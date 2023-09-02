// app/javascript/packs/application.js
import Rails from "@rails/ujs";
import Turbolinks from "turbolinks";
import * as ActiveStorage from "@rails/activestorage";
import "channels";
import "bootstrap";
import "@popperjs/core";
import "../stylesheets/application";
import "../javascripts/home"

Rails.start();
Turbolinks.start();
ActiveStorage.start();

