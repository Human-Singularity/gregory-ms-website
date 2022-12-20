import { useLocation } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById("root"));

function ArticleView() {
	const [article, setArticle] = useState([]);
	const location = useLocation();
  const pathname = location.pathname;

  const articleId = pathname.split('/')[2];

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`https://api.gregory-ms.com/articles/${articleId}/?format=json`);
      setArticle(response.data);
    }
    fetchData();
  }, [page]);

	return (
    <div>
      {articleId}
    </div>
  );
	}
	root.render(<ArticleView />);