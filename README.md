# Gregory MS

This is an implementation of the software found at <https://gregory-ai.com/>, configured to assist doctors and people with Multiple Sclerosis find the most up to date information.

<https://gregory-ms.com/>

## Documentation

### Adding new dashboards

1. find the id number of the dashboard and add it to `data/dashboards.json`.
2. place the corresponding shortcode where you want the dashboard to appear. `{{< metabase-embed dashboard="1" width="1300" height="1250" >}}`