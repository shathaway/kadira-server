# Kadira APM

Meteor Development Group has bought Kadira APM from Arunoda. We have made the original Kadira code available under the MIT License in this GitHub repository.

As the code we're running in Galaxy has diverged, we will not be running this repository as an open source project. We've started a conversation with potential maintainers of a community fork.

Arunoda uses the name Kadira for other projects and still owns the trademark on the "Kadira" name. Arunoda requests that public forks should choose a new name.

The Meteor Development Group along with Arunoda, has archived the code at [kadira-open/kadira-server](https://github.com/kadira-open/kadira-server).

## Branches

- A significant branch is [lampewebdev/kadira-server](https://github.com/lampewebdev/kadira-server). It contains some limited package version updates for minimal operation capability.

- Oregon State Police is working with the ''kadira-open'' code base for use on a stand-alone localhost system [shathaway/kadira-server](https://github.com/shathaway/kadira-server).

- NodeChef provides an APM service for Meteor.

- MontiAPM provides an APM service for Meteor.


# kadira-open/kadira-server

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

This is the endpoint you enter into your Meteor project when instrumenting with either:


- meteorhacks:kadira

- mdg:meteor-apm-agent.


