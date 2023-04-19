const search=instantsearch({appId:"5DE3PYXB8W",apiKey:"26e30f4528e8117200c40a23d8c943f9",indexName:"gregory",searchFunction:function(e){document.getElementsByClassName("ais-hits"),""!==e.state.query&&e.search()}});var hitTemplate='<div class="hit media"><div class="media-left"><img src="{{image}}" /></div><div class="media-body"><h4 class="media-heading">{{{_highlightResult.title.value}}} {{#stars}}<span class="ais-star-rating--star{{^.}}__empty{{/.}}"></span>{{/stars}}</h4><p class="content">{{_snippetResult.content.value}}</p></div></div>',hitTemplateCard=`
<div class="card card-plain card-blog">
    <div class="row">
        <div class="col-md-12">
            
            <h3 class="card-title">
                <a href="{{uri}}">{{title}}</a>  
            </h3>
            <p class="card-description">
                
                <br>
                <a href="{{uri}}">Continue Reading </a>
            </p>
            <p class="author">
                
                <time class="published" itemprop="datePublished" datetime=" {{discovery_date}} ">{{discovery_date}}</time>
                <span class="badge badge-info text-white font-weight-normal">{{source}}</span>
            </p>
        </div>
    </div>
</div>
`,noResultsTemplate='<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>';search.addWidget(instantsearch.widgets.searchBox({container:".form-group",placeholder:"Start typing …",cssClasses:{input:"search-input hideInput form-control"},autofocus:!0,poweredBy:!0,magnifier:!1,reset:!1})),search.addWidget(instantsearch.widgets.hits({container:"div.search-hits",templates:{empty:noResultsTemplate,item:hitTemplateCard},hitsPerPage:9})),search.start();