---
title: "Developers"
subtitle: "GregoryAI is an Open Source Project to help filter medical research"
date: 2021-08-11T15:27:16+01:00
lastmod: 
author: Bruno Amaral
options:
  unlisted: false
  header: mini
description: GregoryAi, information for developers researching multiple sclerosis and other diseases
categories: []
tags: []
layout: page

draft: false
enableDisqus : true
enableMathJax: false
disableToC: false
disableAutoCollapse: true

resources:
  - src: lagos-techie-kwzWjTnDPLk-unsplash.jpeg
    name: header

cta:
  - label: GregoryAi <i class="fas fa-external-link-alt text-xs ms-1" aria-hidden="true"></i>
    url: https://gregory-ai.com/
    classes: btn btn-info umami--click--gregory-ai-header-button

---

<div class="col-md-6 mx-auto">

## Open Source AI Research Tool{.title}

For detailed documentation to install Gregory on your server and up to date information, visit https://gregory-ai.com/.

If you have any questions, please open an [issue](https://github.com/brunoamaral/gregory/issues) or [discussion](https://github.com/brunoamaral/gregory/discussions) on GitHub

## Installing GregoryAi

[This software is open source and available on GitHub, with instructions to install it using docker images](https://github.com/brunoamaral/gregory#install).

### Hardware requirements{.title}

Gregory MS is running on a [Digital Ocean](https://digitalocean.com) virtual private server.

- 2 vCPU
- 4 GB Memory
- 80 GB Disk
- Ubuntu 20.04 (LTS) x64

### Software requirements{.title}

- Python 3.9
- [Hugo](https://gohugo.io/)


## Access the information{.title}

### RSS{.title .text-primary}

There is an RSS feed to list the latest articles by a specific author.

You can access it by replacing `<orcid>` with the ORCID identifier of the author.

`https://api.gregory-ms.com/feed/author/<orcid>/`

**Clinical Trials RSS Feed**

Access clinical trials for multiple sclerosis. Updated daily.

`https://api.gregory-ms.com/feed/trials/subject/multiple-sclerosis`

### API Endpoints{.title .text-primary}

The API is served using Django Rest Framework and can be accessed at <https://api.gregory-ms.com/>. 

### Articles{.title .text-muted}

**List all articles**

`https://api.gregory-ms.com/articles/all?format=json`

**List article that matches the {ID} number.**    

`https://api.gregory-ms.com/articles/id/{ID}`

Example: <a data-umami-event="click--developers-api-latest-trials-example" href="https://api.gregory-ms.com/articles/19">https://api.gregory-ms.com/articles/19</a>


**List all relevant articles.**

These are articles that we show on the home page because they appear to offer new courses of treatment.

`https://api.gregory-ms.com/articles/relevant`

#### Articles' Sources{.title .text-muted}

**List all articles from specified {source}.**

`https://api.gregory-ms.com/articles/source/{source_id}/`


**List all available sources.**

`https://api.gregory-ms.com/sources/`

### Trials{.title .text-muted}

**List all trials.**    

`https://api.gregory-ms.com/trials/all?format=json`

Example: <a href="https://api.gregory-ms.com/trials/all">https://api.gregory-ms.com/trials/all</a>

#### Trials' Sources{.title .text-muted}

**List all trials from specified {source}.**    

`https://api.gregory-ms.com/trials/source/{source_id}`

Example: <a data-umami-event="click--developers-api-all-trials-by-source-example" href="https://api.gregory-ms.com/trials/source/12/">https://api.gregory-ms.com/trials/source/12/</a>

## Database Structure{.title .text-primary}

### Articles{.title .text-muted}

The JSON response contains information on scientific articles retrieved from multiple academic sources.

Available fields can be found at https://api.gregory-ms.com/articles/ by clicking the options button.


### Trials{.title .text-muted}

Data available at https://api.gregory-ms.com/trials/ by clicking the options button.

## Resources

[GitHub repository](https://github.com/brunoamaral/gregory)

[Mobility Report from Apple Watch Data](https://github.com/brunoamaral/mobility-report)

The **Mobility report** is meant to be used as a snapshot of the patient's mobility and walking assymetry using [Apple's HealthKit](https://developer.apple.com/documentation/healthkit) data from the Apple Watch.

</div>