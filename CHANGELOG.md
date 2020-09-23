# Changes to Kadira APM

These changes are being captured by GitHub repository
![shathaway/kadira-server](https://github.com/shathaway/kadira-server).

This GitHub repository is for public consumption. The actual development
work is performed separately and needs to have proprietary information 
removed before being posted. Our internal documents may be rewritten
for public consumption and posted to the repository branches at some
future date.

The main branch of this repository shall contain a usable deployment
capability. Branches labeled **v1.0.0**, and **v2.0.0** are for posting
release specific patches.

Our in-house development uses **subversion** for project tracking.
Extracts are then used to update the **GitHub** repository sometime later.

Items tagged with CCYY-MM-DD (SVN) indicate internal project release dates
found in our subversion tracking system.

## Development Activity

### v0.0.0 2020-05-22 (SVN)
This is the initial copy of 
![kadira-open/kadira-server](https://github.com/kadira-open/kadira-server).

### v1.0.0 2020-06-24 (SVN)
This branch tracks the code base for initial operational deployment
on a single CentOS-7 system. No significant changes other than minor version
updates are mode to the code base. New documents are being added.

Supported architecture is:
- CentOS-7 operating system
- NGINX web application proxy server
- MongoDb 3.6 database via npm mongodb@2.2.x driver
- Meteor 1.4.3.2 for the user dashboard
- Node.js 4.8.4

### v2.0.0 2020-09-17 (SVN)
This branch tracks an updated operational code base. It is an upgrade to *v1.0.0*
based on single computer hosting configurations.

Supported architecture is:
- CentOS-7 operating system
- NGINX web application proxy server
- MongoDb 3.6 database via npm mongodb@3.2.x driver
- Meteor 1.8.3 for the user dashboard
- Node.js 8.17.0

Service changes include:
- LIBRATO tracking services are removed.
- Email notifications are currently disabled.

Testing Services:
- kadira-engine/test (updated and validated)
- kadira-ui/tests/gagarin (not supported)
- Travis continuous integration service (not supported)
- Circle continuous integration service (not supported)

**To Do**

Remove dependencies on kadira.io domain references.

Remove dependencies on swipe billing services.

Create custom application management without requiring billing plan artifacts.

Enable support for email notifications to users.

### v3.0.0
Next branch to track future operational code base.
- CentOS-8 operating system
- NGINX web application proxy server
- MongoDb 4.4 database via npm mongodb@3.6.x driver
- Meteor 1.11 for the user dashboard
- Node.js 12.18.3


