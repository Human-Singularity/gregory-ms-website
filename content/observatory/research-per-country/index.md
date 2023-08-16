---
title: "Multiple Sclerosis research per country"
subtitle: Authors and number of articles found by Gregory-AI
date: 2023-08-14T16:56:34Z
lastmod: 
author: Bruno Amaral
options:
  unlisted: false
  header: mini
  navbar: navbar navbar-expand-lg bg-white fixed-top font-weight-bold

resources:
  - src: markus-winkler-IrRbSND5EUc-unsplash.jpg
    name: header

layout: page
description: Real time data on Multiple Sclerosis research by country
categories: []
tags: []
slug: research-per-country
enableDisqus : false
enableMathJax: false
disableToC: false
disableAutoCollapse: true
---

<div class="row justify-content-center align-items-start mb-5 mt-5 p-md-5">
<div class="col-md-8">
<p>If the data below doesn't load, refresh the page or click 
<a href="https://metabase.gregory-ms.com/public/dashboard/ce92fcfa-ed1f-4880-8681-a6286f698216" class="font-weight-bold" target="_blank">Open in new tab <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:14px; height:auto;" class="">
<path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z" fill="#dc3600"></path>
</svg></a>
</p>

<div class="embed-responsive embed-responsive-4by3">
  {{< metabase-embed dashboard="27" width="" height="" >}}
</div>

</div>

  <div class="col-md-4 col-12 justify-content-center ">
    <div class="col-md-12 ml-auto mr-auto">
                <div class="card card-contact card-raised">
                  <form role="form" id="contact-form1" method="post" action="https://api.gregory-ms.com/subscriptions/new/">
                    <div class="card-header text-center px-3">
                      <h4 class="card-title font-weight-bold">Weekly digest of relevant papers on Multiple Sclerosis</h4>
                      <p class="p-3">Every tuesday, and email with the latest research filtered by Machine Learning and human review.</p>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 pr-2">
                          <label>First name</label>
                          <div class="input-group">
                            <div class="input-group-prepend">
                              <span class="input-group-text pr-2"><i class="now-ui-icons users_circle-08"></i></span>
                            </div>
                            <input type="text" name="first_name" class="form-control" placeholder="First Name..." aria-label="First Name..." autocomplete="given-name">
                          </div>
                        </div>
                        <div class="col-md-6 pl-2">
                          <div class="form-group">
                            <label>Last name</label>
                            <div class="input-group">
                              <div class="input-group-prepend">
                                <span class="input-group-text pr-2"><i class="now-ui-icons text_caps-small"></i></span>
                              </div>
                              <input type="text" name="last_name" class="form-control" placeholder="Last Name..." aria-label="Last Name..." autocomplete="family-name">
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="form-group">
                        <label>Email address</label>
                        <div class="input-group">
                          <div class="input-group-prepend">
                            <span class="input-group-text pr-2"><i class="now-ui-icons ui-1_email-85"></i></span>
                          </div>
                          <input type="email" name="email" id="email" class="form-control" placeholder="Email Here..." autocomplete="email">
                        </div>
                      </div>
                      <div class="form-group">
                        <label>I am a...</label>
                        <div class="input-group">
                          <select id="profile" name="profile" class="form-control">
                            <option value="researcher">researcher</option>
                            <option value="doctor">doctor</option>
                            <option value="clinical centre">clinical centre</option>
                            <option value="patient">patient</option>
                          </select>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 ml-auto mr-auto text-center">
                          <input value="2" name="list" id="list" type="hidden">
                          <button type="submit" class="btn btn-primary btn-round mr-auto ml-auto font-weight-bold">Subscribe</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
  </div>
</div>


<div class="row">
<div class="col-8 mx-auto">

## Source for the author data{.title}

Authors are discovered based on the ongoing search for new papers around Multiple Sclerosis. We collect author information from [ORCID](https://orcid.org/), and identify the country based on the information they have made available on their profile.

At the moment (August 2023) we are not taking into account the author's afiliation with an institution.

We try to match the article to the corresponding ORCID numbers, this may fail for a number of reasons.

1. The article may not contain a list of ORCID numbers for us to index. In this case we try to match their given name and family name to existing ORCID records we have.
2. The authors may not be registered on ORCID, in which case we add their name to our records but can't get data about their country.

</div>
</div>