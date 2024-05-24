# Gregory MS

This is an implementation of the software found at <https://gregory-ai.com/>, configured to assist doctors and people with Multiple Sclerosis find the most up to date information.

<https://gregory-ms.com/>

## Documentation

### Metabase

[Metabase](https://www.metabase.com/) is a tool for business intelligence that you can use to build dashboards.

We have a separate `metabase` container in the docker-compose.yaml file that connects directly to Gregory's database.

It's available at <http://localhost:3000/>

The current website also uses some embeded dashboards whose keys are produced each time you run `build.py`. An example can be found in the [MS Observatory Page](https://gregory-ms.com/observatory/)

<img src="images/image-20220619200017849.png" alt="image-20220619200017849" style="zoom:33%;" />

Including dashboards in your content:

1. Add the dashboard ID to `data/dashboards.json`
2. In your content, use the shortcode `{{ metabase-embed dashboard="10" width="1300" height="1250" }}`
3. Run `build.py`