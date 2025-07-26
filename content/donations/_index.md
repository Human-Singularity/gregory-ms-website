---
authors:
  - bruno-amaral
date: 2023-05-01T18:15:13+01:00
description: ""
draft: false
resources: 
- src: pexels-cottonbro-6153360.jpeg
  name: "header"
- src: "gallery/*.jpg"
  name: gallery-:counter
  title: gallery-title-:counter
- src:
  name: slide-1
slug:
subtitle: 
layout: page
tags: 
  - 
categories: 
  - 
title: "Help keep Gregory-MS running"
layout: page
options:
  unlisted: false
  showHeader: true
  hideFooter: false
  hideSubscribeForm: true
  header: mini
cta:
  - label: Donate with Stripe 
    url: https://donate.stripe.com/6oEeVmf1tdHIdOw7ss
    classes: btn btn-lg font-weight-bold bg-success btn-success 
scripts:
  - '<script src="/js/donations-dashboard.js"></script>'
---

<div class="container">
  <div class="row">
    <div class="col-md-8 mx-auto">
      <div class="text-center mb-5">
        <p class="lead font-weight-normal">This is a patient-led project that runs with open-source and free software. Your support helps us maintain the platform and develop new features to help patients and doctors access the most up-to-date information.</p>
      </div>
      <!-- Goal Progress Section -->
      <div class="card border-0 shadow-sm mb-5">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h5 class="mb-3 title"><i class="fas fa-target text-primary"></i> 2025 Goal</h5>
              <div class="progress mb-3" style="height: 20px;">
                <div id="progress-bar" class="progress-bar bg-gradient-success" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="500">
                  <span id="progress-text" class="fw-bold">€0 / €500</span>
                </div>
              </div>
              <p class="mb-0">Help us reach our €500 goal to cover hosting, domain, and platform maintenance costs for 2025.</p>
            </div>
            <div class="col-md-4 text-center">
              <div class="p-3 bg-light rounded">
                <i class="fas fa-euro-sign fa-3x text-success mb-3"></i>
                <h6 id="goal-percentage" class="text-success mb-1">0%</h6>
                <p class="small mb-0">of goal reached</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Donation Button -->
      <div class="row justify-content-center mb-4">
      <div class="mb-4">
          <a href="https://donate.stripe.com/6oEeVmf1tdHIdOw7ss" target="_blank" class="btn btn-info btn-round btn-lg font-weight-bold" data-umami-event="click--donate-button">
            <i class="fas fa-heart me-2"></i> Donate now
            <i class="fas fa-arrow-circle-right ms-2" aria-hidden="true"></i>
          </a>
        </div>
      <!-- Recent Donations Section -->
      <div class="card border-0 shadow-sm mb-5">
        <div class="card-body p-4">
          <h5 class="title mb-4"><i class="fas fa-list text-info"></i> Recent Supporters</h5>
          <div id="recent-donations-loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-2">Loading recent donations...</p>
          </div>
          <div id="recent-donations-list" class="d-none">
            <!-- Will be populated by JavaScript -->
          </div>
          <div id="recent-donations-error" class="d-none">
            <div class="alert alert-warning" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>
              Unable to load recent donations at this time. Please try again later.
            </div>
          </div>
        </div>
      </div>
      <!-- How We Process Donations -->
      <div class="card border-0 shadow-sm mb-5">
        <div class="card-body p-4">
          <h5 class="mb-3"><i class="fas fa-shield-alt text-success"></i> How we process donations</h5>
          <p class="mb-3">Currently, our donations are processed through a non-profit called <a href="https://human-singularity.org/" target="_blank">Human Singularity Network</a> using payment processing by Stripe. The Human Singularity Network is registered in Portugal with the <strong>Tax ID 517 563 363</strong></p>
          <div class="row">
            <div class="col-md-6 mb-3">
              <a href="https://human-singularity.org/" target="_blank" class="btn btn-outline-primary">
                <i class="fas fa-external-link-alt me-2"></i> Open the Human Singularity Website
              </a>
            </div>
            <div class="col-md-6 mb-3">
              <a href="/annual-review/" class="btn btn-secondary">
                <i class="fas fa-file-alt me-2"></i> Read Our Annual Reports
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- Platform Impact Section -->
      <div class="card border-0 shadow-sm mb-5">
        <div class="card-body p-4">
          <h5 class="mb-4 title"><i class="fas fa-chart-bar text-info"></i> Platform Impact</h5>
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-center p-3 bg-light rounded">
                <div class="me-3">
                  <i class="fas fa-flask fa-2x mr-3 text-primary"></i>
                </div>
                <div>
                  <h6 class="mb-1">Clinical Trials</h6>
                  <p class="mb-0" id="trials-count">Loading...</p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="d-flex align-items-center p-3 bg-light rounded">
                <div class="me-3">
                  <i class="fas fa-file-alt mr-3 fa-2x text-success"></i>
                </div>
                <div>
                  <h6 class="mb-1">Research Articles</h6>
                  <p class="mb-0" id="articles-count">Loading...</p>
                </div>
              </div>
            </div>
          </div>
          <p class="text-muted mt-3 mb-0 small">Real-time data from our continuously updated research database, helping the MS community stay informed about the latest developments.</p>
        </div>
      </div>
      <!-- Financial History -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h5 class="mb-3"><i class="fas fa-history text-warning"></i> Financial History</h5>
          <p class="text-muted">In 2024, our expenses totaled €459,17 for hosting, service fees, and domain costs, with €538 in donations received. <a style="text-decoration: underline;" class="text-info font-weight-bold" href="/annual-review/2024/GregoryMS_Annual_Report_2024.pdf#page=9" target="_blank">View detailed breakdown in our Annual Report</a>.</p>
          <div class="alert alert-info" role="alert">
            <i class="fas fa-info-circle me-2"></i>
            <strong>2024 Update:</strong> Thanks to community support, we achieved our first year of financial self-sustainability! <a href="/annual-review/2024/" class="alert-link">Read more in our 2024 review</a>.
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
