---
date: 2025-01-26T10:00:00Z
description: "Examples and documentation for displaying donation information on Gregory-MS pages"
draft: true
title: "Donations Display Components - Documentation"
---

# Donation Components Documentation

This page demonstrates different ways to display donation information following Gregory-MS design standards, inspired by our annual review presentation style.

## Design Philosophy

Our donation displays follow the same transparency and professionalism standards as our annual reviews:
- **Clear Financial Metrics**: Key statistics prominently displayed
- **Professional Layout**: Clean, card-based design with proper spacing
- **Actionable Elements**: Clear CTAs and links to detailed reports
- **Real-time Data**: Live updates showing current donation status
- **Transparency Links**: Easy access to full financial reports

---

## 1. Full Recent Donations Section

**Use case**: Dedicated donation pages or major page sections
**Features**: Complete dashboard with metrics, recent donors table, and transparency links

{{< recent-donations style="full" >}}

---

## 2. Compact Donations Section

**Use case**: Smaller spaces or as part of other content pages
**Features**: Condensed version with essential metrics and recent donors

{{< recent-donations style="compact" limit="5" >}}

---

## 3. Donations Widget

**Use case**: Sidebars, footer areas, or small embedded spaces
**Features**: Minimal footprint with key stats and recent activity

{{< recent-donations style="widget" >}}

---

## 4. Simple Donation Call-to-Action

**Use case**: Basic donation buttons throughout the site
**Features**: Clean button design with tracking

<div class="text-center my-4">
  <a href="https://donate.stripe.com/4gMbJ02IA3DqgfU93Y7N602" 
     target="_blank" 
     class="btn btn-success btn-lg"
     data-umami-event="click--donate-button--example">
    <i class="fas fa-heart me-2"></i>
    Support Gregory-MS
    <i class="fas fa-external-link-alt ms-2"></i>
  </a>
</div>

---

## Usage Instructions

### Shortcode Parameters

- `style`: "full", "compact", or "widget" (default: "full")
- `limit`: Number of recent donations to show (default: "10")
- `showStats`: "true" or "false" to show/hide statistics (default: "true")

### Examples:

```
<!-- Full section with all features -->
{{< recent-donations >}}

<!-- Compact version showing 3 recent donations -->
{{< recent-donations style="compact" limit="3" >}}

<!-- Widget without statistics -->
{{< recent-donations style="widget" showStats="false" >}}
```

### Including in Templates

You can also include the partial files directly in your layouts:

```html
<!-- Include full section -->
{{ partial "recent-donations.html" . }}

<!-- Include widget -->
{{ partial "donations-widget.html" . }}
```
