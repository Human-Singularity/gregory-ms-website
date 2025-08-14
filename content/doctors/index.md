---
authors:
  - bruno-amaral
date: 2021-09-23T20:37:07+01:00
description: ""
draft: false
layout: page
rowclasses: justify-content-center align-self-center
resources: 
- src: images/national-cancer-institute-NFvdKIhxYlU-unsplash.jpeg
  name: "header"
- src: "gallery/*.jpg"
  name: gallery-:counter
  title: gallery-title-:counter
- src:
  name: slide-1
slug:
subtitle: "This site exists to save you time in finding the latest research to help your patients."
tags: 
  - 
categories: 
  - 
title: "For Doctors"
options:
  unlisted: false
  showHeader: true
  hideFooter: false
  hideSubscribeForm: false
  header: mini
  navbar: navbar navbar-expand-lg bg-white fixed-top font-weight-bold
scripts:
  - 
---
</div>

<!-- Evidence snapshots: Tabbed (Systematic Reviews / Clinical Trials) -->
<div class="container-fluid bg-white py-5">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <h3 class="mb-3">Latest Reviews and Clinical Trials</h3>
        <ul class="nav nav-tabs mb-3" role="tablist">
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link active" id="tab-reviews" data-toggle="tab" data-target="#pane-reviews" role="tab" aria-controls="pane-reviews" aria-selected="true">Systematic Reviews</button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link" id="tab-trials" data-toggle="tab" data-target="#pane-trials" role="tab" aria-controls="pane-trials" aria-selected="false">Clinical Trials</button>
          </li>
        </ul>
        <div class="tab-content">
          <div class="tab-pane fade show active" id="pane-reviews" role="tabpanel" aria-labelledby="tab-reviews">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <p class="text-muted small mb-0">Peer‑reviewed summaries of evidence on MS treatments and interventions. Updated daily.</p>
              <a href="/researchers/" class="btn btn-link p-0 small" aria-label="View all systematic reviews">View all</a>
            </div>
            {{< articles-table subject_id="9" external="false" >}}
          </div>
          <div class="tab-pane fade" id="pane-trials" role="tabpanel" aria-labelledby="tab-trials">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <p class="text-muted small mb-0">New and recently updated MS trials from trusted registries. Updated daily.</p>
              <a href="/trials/" class="btn btn-link p-0 small" aria-label="View all clinical trials">View all</a>
            </div>
            {{< trials-table subject_id="1" >}}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- /Evidence snapshots: Tabbed -->
<div class="row justify-content-center align-self-center mb-5 p-md-5 bg-grey">
<div class="col-md-12 col-12 justify-content-center align-self-center ">
  <div class="col-md-12 ml-auto mr-auto">
              <h3 class="mb-3">Subscribe to our free research updates</h3>
                {{< subscribe-form-horizontal >}}
              </div>
</div>
</div>


<div class="row justify-content-center align-self-center mb-5 p-md-5">
  <div class="col-md-4 col-12 align-self-center">
    <img src="images/undraw_medical_research_qg4d.svg" class="w-75 align-middle d-none d-md-block" alt="Email newsletter" loading="lazy" />
  </div>
  <div class="col-md-5 col-12 justify-content-center align-self-center">
    <h3 class="title">Clinical Trials</h3>
    <p class="lead font-weight-normal">We do our best to identify clinical trials for Multiple Sclerosis and publicise them.</p>
    <a href='{{< ref "/trials/_index.md" >}}' class="btn btn-info btn-round btn-lg font-weight-bold" data-umami-event="click--doctors-page-view-trials">View latest clinical trials <i class="ml-1 fas fa-arrow-circle-right"></i></a>
    <a href='{{< ref "/search/_index.md" >}}' class="btn btn-success btn-round btn-lg font-weight-bold" data-umami-event="click--doctors-page-search-trials">Search for MS clinical trials <i class="ml-1 fas fa-arrow-circle-right"></i></a>
    </div>
</div>

<div class="row justify-content-center align-self-center mb-0 p-md-5 bg-grey mb-n5">
  <div class="col-lg-10">
    <div class="card border-0 shadow-sm overflow-hidden">
      <div class="row no-gutters align-items-center">
        <div class="col-md-5">
          <img src="/sources/getty-images-Useu3JMZu6g-unsplash.jpg" class="w-100 h-100 d-none d-md-block" alt="Trusted data sources" loading="lazy" style="object-fit: cover; min-height: 240px;" />
        </div>
        <div class="col-md-7">
          <div class="p-4 p-md-5">
            <h3 class="mb-3">Where the information comes from</h3>
            <p class="text-muted mb-4">Learn about the journals, registries, and databases we monitor to keep this site up to date.</p>
            <a href="/sources/" class="btn btn-info btn-lg font-weight-bold" data-umami-event="click--doctors-page-sources">Explore Data Sources <i class="fas fa-arrow-right ml-2"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

