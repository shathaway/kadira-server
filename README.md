# Kadira APM
Meteor Development Group has bought Kadira APM from Arunoda. We have made the original Kadira code available under the MIT License in this GitHub repository.

As the code we're running in Galaxy has diverged, we will not be running this repository as an open source project. We've started a conversation with potential maintainers of a community fork.

Arunoda uses the name Kadira for other projects and still owns the trademark on the "Kadira" name. Arunoda requests that public forks should choose a new name.

## Development 1.0.0 Fork: shathaway/kadira-server

This is a fork of *kadira-open/kadira-server" to make the Kadira APM usable on a single localhost.
The NGINX software is used as a web application proxy server on the localhost.

It is serviced by MongoDb v3.6 and Meteor v1.4.3.2. The code and configurations have been minimally
upgraded to make the integration operational.

## Disclaimer

This is a set of components you need to run Kadira in your system.

> The following instructions are not production deployment configurations. It's meant for running for testing.

## Initial Setup

Open `init-shell.sh` and update configurations.
Make sure to set fresh DB configurations before getting started.

Then run following three components by visiting their directories:

* kadira-engine
* kadira-rma
* kadira-ui

## Connecting with Kadira Agent

You you are ready to connect your app into Kadira. Since we are running with a custom setup, you need to export following environment variable before using Kadira in your app:

```
export KADIRA_OPTIONS_ENDPOINT=http://localhost:11011
```

> Here's we've assumed http://localhost:11011 as the kadira-engine URL.
