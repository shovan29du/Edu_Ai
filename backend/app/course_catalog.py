"""Curated entry points for external adult-learning course catalogues.

These are catalogue/search pages rather than claims that every listed course is
free.  Each provider record states its access model so the UI can distinguish
open courseware from platforms that also sell certificates or paid courses.
"""

from urllib.parse import quote_plus


PROVIDERS = [
    {
        "id": "mit-ocw",
        "name": "MIT OpenCourseWare",
        "url": "https://ocw.mit.edu/search/",
        "access": "Free and open course materials",
        "kind": "open",
        "category": "courses",
    },
    {
        "id": "harvard-free",
        "name": "Harvard Professional & Lifelong Learning",
        "url": "https://pll.harvard.edu/catalog/free",
        "access": "Free-course catalogue; some optional certificates may cost",
        "kind": "mixed",
        "category": "courses",
    },
    {
        "id": "edx",
        "name": "edX",
        "url": "https://www.edx.org/search",
        "access": "Many courses can be audited; certificates may cost",
        "kind": "mixed",
        "category": "courses",
    },
    {
        "id": "coursera",
        "name": "Coursera",
        "url": "https://www.coursera.org/search",
        "access": "Some courses offer free access or audit; certificates may cost",
        "kind": "mixed",
        "category": "courses",
    },
    {
        "id": "udemy",
        "name": "Udemy",
        "url": "https://www.udemy.com/courses/free/",
        "access": "Free-course collection plus paid courses",
        "kind": "mixed",
        "category": "courses",
    },
    {
        "id": "openlearn",
        "name": "OpenLearn — The Open University",
        "url": "https://www.open.edu/openlearn/free-courses/full-catalogue",
        "access": "Free courses",
        "kind": "open",
        "category": "courses",
    },
    {
        "id": "saylor",
        "name": "Saylor Academy",
        "url": "https://learn.saylor.org/course/index.php",
        "access": "Free self-paced courses",
        "kind": "open",
        "category": "courses",
    },
    {
        "id": "khan-academy",
        "name": "Khan Academy",
        "url": "https://www.khanacademy.org/",
        "access": "Free learning resources",
        "kind": "open",
        "category": "courses",
    },
    {
        "id": "youtube-courses",
        "name": "YouTube — free courses",
        "url": "https://www.youtube.com/results?search_query=free+full+course",
        "access": "Free videos; availability and licensing vary by channel",
        "kind": "open",
        "category": "video",
    },
    {
        "id": "open-library",
        "name": "Open Library",
        "url": "https://openlibrary.org/",
        "search_template": "https://openlibrary.org/search?q={query}&mode=everything",
        "access": "Search millions of catalogue records; eligible editions can be borrowed online",
        "kind": "borrow",
        "category": "books",
    },
    {
        "id": "project-gutenberg",
        "name": "Project Gutenberg",
        "url": "https://www.gutenberg.org/",
        "search_template": "https://www.gutenberg.org/ebooks/search/?query={query}",
        "access": "Free public-domain ebooks; local copyright rules still apply",
        "kind": "public-domain",
        "category": "books",
    },
    {
        "id": "standard-ebooks",
        "name": "Standard Ebooks",
        "url": "https://standardebooks.org/ebooks",
        "search_template": "https://standardebooks.org/ebooks?query={query}",
        "access": "Carefully produced public-domain ebooks",
        "kind": "public-domain",
        "category": "books",
    },
    {
        "id": "wikisource",
        "name": "Wikisource",
        "url": "https://en.wikisource.org/wiki/Main_Page",
        "search_template": "https://en.wikisource.org/w/index.php?search={query}",
        "access": "Free source texts and translations maintained by Wikimedia contributors",
        "kind": "open",
        "category": "books",
    },
    {
        "id": "doab",
        "name": "Directory of Open Access Books",
        "url": "https://www.doabooks.org/",
        "search_template": "https://directory.doabooks.org/discover?query={query}",
        "access": "Peer-reviewed open-access academic books",
        "kind": "open",
        "category": "books",
    },
    {
        "id": "oapen",
        "name": "OAPEN Library",
        "url": "https://library.oapen.org/",
        "search_template": "https://library.oapen.org/discover?query={query}",
        "access": "Open-access scholarly books with item-level licence information",
        "kind": "open",
        "category": "books",
    },
    {
        "id": "bhl",
        "name": "Biodiversity Heritage Library",
        "url": "https://www.biodiversitylibrary.org/",
        "search_template": "https://www.biodiversitylibrary.org/search?searchTerm={query}",
        "access": "Open-access biodiversity literature, illustrations and archives",
        "kind": "open",
        "category": "books",
    },
    {
        "id": "librivox",
        "name": "LibriVox",
        "url": "https://librivox.org/search",
        "search_template": "https://librivox.org/search?search_form=advanced&q={query}",
        "access": "Volunteer-read public-domain audiobooks, free to stream or download",
        "kind": "public-domain",
        "category": "audio",
    },
    {
        "id": "internet-archive",
        "name": "Internet Archive",
        "url": "https://archive.org/",
        "search_template": "https://archive.org/search?query={query}",
        "access": "Texts, audio, video, software and web archives; check each item's rights statement",
        "kind": "mixed",
        "category": "multimedia",
    },
    {
        "id": "wikimedia-commons",
        "name": "Wikimedia Commons",
        "url": "https://commons.wikimedia.org/wiki/Main_Page",
        "search_template": "https://commons.wikimedia.org/w/index.php?search={query}&title=Special%3AMediaSearch",
        "access": "Freely licensed and public-domain images, audio, video and other media",
        "kind": "open",
        "category": "multimedia",
    },
    {
        "id": "openverse",
        "name": "Openverse",
        "url": "https://openverse.org/",
        "search_template": "https://openverse.org/search/?q={query}",
        "access": "Creative Commons and public-domain images and audio with attribution help",
        "kind": "open",
        "category": "multimedia",
    },
    {
        "id": "nasa-media",
        "name": "NASA Image and Video Library",
        "url": "https://images.nasa.gov/",
        "search_template": "https://images.nasa.gov/search?q={query}",
        "access": "NASA images, video and audio; consult NASA media-usage guidance",
        "kind": "government",
        "category": "multimedia",
    },
    {
        "id": "europeana",
        "name": "Europeana",
        "url": "https://www.europeana.eu/en",
        "search_template": "https://www.europeana.eu/en/search?query={query}",
        "access": "Art, books, films and music from European cultural institutions; rights vary by item",
        "kind": "mixed",
        "category": "culture",
    },
    {
        "id": "smithsonian-open-access",
        "name": "Smithsonian Open Access",
        "url": "https://www.si.edu/OpenAccess",
        "search_template": "https://www.si.edu/search?edan_q={query}&edan_fq%5B%5D=media_usage%3ACC0",
        "access": "Millions of reusable CC0 2D and 3D collection items",
        "kind": "cc0",
        "category": "culture",
    },
    {
        "id": "loc-free-to-use",
        "name": "Library of Congress — Free to Use",
        "url": "https://www.loc.gov/free-to-use/",
        "search_template": "https://www.loc.gov/search/?q={query}&fa=partof%3Afree+to+use+and+reuse",
        "access": "Curated rights-free images, maps, books, films and recordings; read item notes",
        "kind": "open",
        "category": "culture",
    },
    {
        "id": "dpla",
        "name": "Digital Public Library of America",
        "url": "https://dp.la/",
        "search_template": "https://dp.la/search?q={query}",
        "access": "Discovery across US libraries, archives and museums; rights vary by item",
        "kind": "mixed",
        "category": "culture",
    },
    {
        "id": "nypl-digital",
        "name": "NYPL Digital Collections",
        "url": "https://digitalcollections.nypl.org/",
        "search_template": "https://digitalcollections.nypl.org/search/index?keywords={query}",
        "access": "Digitised manuscripts, maps, photographs, prints, audio and video; filter public domain",
        "kind": "mixed",
        "category": "culture",
    },
    {
        "id": "national-archives-us",
        "name": "US National Archives Catalog",
        "url": "https://catalog.archives.gov/",
        "search_template": "https://catalog.archives.gov/search?q={query}",
        "access": "Government records, photographs, films, maps and audio; check item restrictions",
        "kind": "government",
        "category": "culture",
    },
]

# Broad international directory.  An entry means "search this source"; it does
# not imply every item is reusable.  The access text and kind badge deliberately
# distinguish open licences, public domain, free viewing, borrowing, and mixed
# collections.
_MORE_PROVIDERS = [
    # Libraries and text archives
    ("gallica", "Gallica — Bibliothèque nationale de France", "https://gallica.bnf.fr/", "Books, manuscripts, maps, images, audio and scores; item rights vary", "mixed", "books", "https://gallica.bnf.fr/services/engine/search/sru?operation=searchRetrieve&query={query}"),
    ("trove", "Trove — National Library of Australia", "https://trove.nla.gov.au/", "Australian newspapers, books, images, maps and archives; item rights vary", "mixed", "books", "https://trove.nla.gov.au/search?keyword={query}"),
    ("digital-bodleian", "Digital Bodleian", "https://digital.bodleian.ox.ac.uk/", "Digitised Oxford manuscripts, rare books, maps and archives with item rights", "mixed", "books", "https://digital.bodleian.ox.ac.uk/search/?q={query}"),
    ("qatar-digital-library", "Qatar Digital Library", "https://www.qdl.qa/en", "Digitised Gulf history, maps, manuscripts and sound; reusable item licences shown", "open", "books", "https://www.qdl.qa/en/search/site/{query}"),
    ("perseus", "Perseus Digital Library", "https://www.perseus.tufts.edu/", "Classical texts, translations, dictionaries and primary sources", "open", "books", None),
    ("hathitrust", "HathiTrust Digital Library", "https://www.hathitrust.org/", "Bibliographic and digitised-book search; full view depends on rights and location", "mixed", "books", "https://catalog.hathitrust.org/Search/Home?lookfor={query}&type=all"),
    ("google-books", "Google Books", "https://books.google.com/", "Book discovery with full view, preview or metadata depending on rights", "mixed", "books", "https://books.google.com/books?q={query}"),
    ("pressbooks-directory", "Pressbooks Directory", "https://pressbooks.directory/", "Searchable directory of openly licensed books published on Pressbooks networks", "open", "books", "https://pressbooks.directory/?q={query}"),
    ("open-textbook-library", "Open Textbook Library", "https://open.umn.edu/opentextbooks", "Expert-reviewed, openly licensed textbooks", "open", "books", "https://open.umn.edu/opentextbooks/textbooks?term={query}"),
    ("core", "CORE Open Access Papers", "https://core.ac.uk/", "Large open-access research-paper discovery service", "open", "books", "https://core.ac.uk/search?q={query}"),
    ("arxiv", "arXiv", "https://arxiv.org/", "Open research preprints across science, computing, economics and related fields", "open", "books", "https://arxiv.org/search/?query={query}&searchtype=all"),

    # Federated/open media servers and reusable media
    ("sepiasearch", "Sepia Search — PeerTube Network", "https://search.joinpeertube.org/", "Search videos, channels and playlists across participating PeerTube servers; licences vary", "federated", "media-server", "https://search.joinpeertube.org/search?search={query}"),
    ("peertube-instances", "PeerTube Platform Directory", "https://joinpeertube.org/browse-content", "Discover independently operated federated video platforms", "federated", "media-server", None),
    ("funkwhale", "Funkwhale Network", "https://www.funkwhale.audio/", "Federated open-source audio publishing and listening network; licences vary", "federated", "media-server", None),
    ("freesound", "Freesound", "https://freesound.org/", "Community audio under Creative Commons licences; verify each file's licence", "mixed", "media-server", "https://freesound.org/search/?q={query}"),
    ("blender-open-movies", "Blender Open Movies", "https://studio.blender.org/films/", "Open movie projects and production assets released with open licences", "open", "media-server", None),
    ("musopen", "Musopen", "https://musopen.org/", "Public-domain and Creative Commons music recordings, scores and education", "mixed", "media-server", "https://musopen.org/music/?q={query}"),
    ("inaturalist", "iNaturalist Observations", "https://www.inaturalist.org/", "Global biodiversity photographs, sounds and observations; licences vary per item", "mixed", "media-server", "https://www.inaturalist.org/observations?subview=map&q={query}"),

    # Open news, public-interest reporting and open news data
    ("wikinews", "Wikinews", "https://en.wikinews.org/", "Collaborative news published under Creative Commons Attribution", "open", "news", "https://en.wikinews.org/w/index.php?search={query}"),
    ("gdelt", "GDELT Project", "https://www.gdeltproject.org/", "Free open global news-event data and visualisation for research", "open-data", "news", None),
    ("global-voices", "Global Voices", "https://globalvoices.org/", "International citizen-media reporting; site content generally uses CC BY 3.0", "open", "news", "https://globalvoices.org/?s={query}"),
    ("the-conversation", "The Conversation", "https://theconversation.com/", "Academic journalism free to read and republish under stated article terms", "mixed", "news", "https://theconversation.com/global/search?q={query}"),
    ("reliefweb", "ReliefWeb", "https://reliefweb.int/", "UN humanitarian news, reports, maps and situation updates; check document terms", "public", "news", "https://reliefweb.int/search?search={query}"),
    ("media-cloud", "Media Cloud", "https://www.mediacloud.org/", "Open-source tools and datasets for analysing news media", "open-data", "news", None),
    ("propublica", "ProPublica", "https://www.propublica.org/", "Non-profit public-interest journalism; free to read, reuse governed by site terms", "free-view", "news", "https://www.propublica.org/search?q={query}"),
    ("nasa-news", "NASA News", "https://www.nasa.gov/news/", "Public NASA mission, science and exploration news; media guidance applies", "government", "news", "https://www.nasa.gov/?search={query}"),
    ("uk-government-news", "UK Government News", "https://www.gov.uk/search/news-and-communications", "Official UK news and communications; most text is under the Open Government Licence", "government", "news", "https://www.gov.uk/search/news-and-communications?keywords={query}"),
    ("eu-newsroom", "European Commission Newsroom", "https://ec.europa.eu/commission/presscorner/home/en", "Official EU press releases and statements; consult reuse notice", "government", "news", "https://ec.europa.eu/commission/presscorner/home/en?search={query}"),

    # Museum open-access and online collections
    ("met-open-access", "The Met Open Access", "https://www.metmuseum.org/art/collection", "Public-domain artwork images marked Open Access are CC0", "cc0", "museum", "https://www.metmuseum.org/art/collection/search?q={query}"),
    ("rijksmuseum", "Rijksmuseum Collection Online", "https://www.rijksmuseum.nl/en/collection", "High-resolution public-domain/CC0 works where indicated", "cc0", "museum", "https://www.rijksmuseum.nl/en/search?q={query}"),
    ("getty-open-content", "Getty Open Content", "https://www.getty.edu/art/collection/", "Public-domain artwork images marked Open Content are available under CC0", "cc0", "museum", "https://www.getty.edu/art/collection/search?query={query}"),
    ("artic", "Art Institute of Chicago", "https://www.artic.edu/collection", "Open-access public-domain images are marked CC0; other item rights vary", "mixed", "museum", "https://www.artic.edu/collection?q={query}"),
    ("cleveland-museum", "Cleveland Museum of Art Open Access", "https://www.clevelandart.org/art/collection", "Open Access collection images and metadata are CC0 where marked", "cc0", "museum", "https://www.clevelandart.org/art/collection/search?search={query}"),
    ("nga", "National Gallery of Art Open Access", "https://www.nga.gov/artworks/free-images-and-open-access", "Downloadable open-access images of public-domain works", "open", "museum", "https://www.nga.gov/search.html?searchterm={query}"),
    ("yale-collections", "Yale University Art Gallery", "https://artgallery.yale.edu/collections/objects", "Collection discovery with public-domain images available for unrestricted use where marked", "mixed", "museum", "https://artgallery.yale.edu/collections/objects?search={query}"),
    ("harvard-art", "Harvard Art Museums", "https://harvardartmuseums.org/collections", "Collection images and data with object-level rights information", "mixed", "museum", "https://harvardartmuseums.org/collections?q={query}"),
    ("cooper-hewitt", "Cooper Hewitt Collection", "https://collection.cooperhewitt.org/", "Smithsonian design collection; CC0 items are marked for reuse", "mixed", "museum", "https://collection.cooperhewitt.org/search/collection/?query={query}"),
    ("walters", "Walters Art Museum", "https://art.thewalters.org/", "Digital collection with open-access images for many public-domain works", "open", "museum", "https://art.thewalters.org/browse/?q={query}"),

    # Open courses and OER repositories
    ("oer-commons", "OER Commons", "https://www.oercommons.org/", "Openly licensed courses, textbooks, lesson plans and learning objects", "open", "courses", "https://www.oercommons.org/search?f.search={query}"),
    ("libretexts", "LibreTexts", "https://commons.libretexts.org/", "Adaptable open textbooks, courses, simulations and homework resources", "open", "courses", "https://commons.libretexts.org/?search={query}"),
    ("openstax", "OpenStax", "https://openstax.org/subjects", "Peer-reviewed openly licensed textbooks and aligned learning materials", "open", "courses", None),
    ("merlot", "MERLOT", "https://www.merlot.org/merlot/", "Curated learning materials with item-level licence and access information", "mixed", "courses", "https://www.merlot.org/merlot/materials.htm?keywords={query}"),
    ("skillscommons", "SkillsCommons", "https://www.skillscommons.org/", "Open workforce-development courses and programme materials", "open", "courses", "https://www.skillscommons.org/discover?query={query}"),
    ("nptel", "NPTEL", "https://nptel.ac.in/courses", "Free university-level engineering, science and humanities course videos; certificates may cost", "mixed", "courses", "https://nptel.ac.in/courses?searchQuery={query}"),
    ("open-yale", "Open Yale Courses", "https://oyc.yale.edu/courses", "Free access to selected introductory Yale course lectures and materials", "free-view", "courses", None),
    ("stanford-see", "Stanford Engineering Everywhere", "https://see.stanford.edu/Course", "Free engineering and computer-science course materials", "free-view", "courses", None),
    ("carnegie-oli", "Carnegie Mellon Open Learning Initiative", "https://oli.cmu.edu/courses/", "Open and low-cost interactive courses; access terms vary by course", "mixed", "courses", None),
    ("openwho", "OpenWHO", "https://openwho.org/courses", "Free health-emergency and public-health courses from WHO", "free-view", "courses", None),
    ("fao-elearning", "FAO elearning Academy", "https://elearning.fao.org/", "Free multilingual courses on food, agriculture and sustainable development", "free-view", "courses", None),
    ("uncclearn", "UN CC:e-Learn", "https://unccelearn.org/courses/", "Free climate-change and green-economy courses; optional certificates vary", "free-view", "courses", None),
    ("moocfi", "MOOC.fi — University of Helsinki", "https://www.mooc.fi/en/", "Free open online courses including programming and AI", "free-view", "courses", None),
    ("openhpi", "openHPI", "https://open.hpi.de/courses", "Free technology and digital-skills MOOCs", "free-view", "courses", None),
    ("wikiversity", "Wikiversity", "https://www.wikiversity.org/", "Free learning resources, projects and courses from Wikimedia communities", "open", "courses", None),
]

for _id, _name, _url, _access, _kind, _category, _search_template in _MORE_PROVIDERS:
    PROVIDERS.append({
        "id": _id,
        "name": _name,
        "url": _url,
        "access": _access,
        "kind": _kind,
        "category": _category,
        **({"search_template": _search_template} if _search_template else {}),
    })


def catalogue(query: str = "") -> dict:
    query = query.strip()
    providers = []
    for provider in PROVIDERS:
        item = dict(provider)
        if query:
            encoded = quote_plus(f"{query} free full course")
            source_query = quote_plus(query)
            if provider["id"] == "youtube-courses":
                item["search_url"] = f"https://www.youtube.com/results?search_query={encoded}"
            elif provider["id"] == "mit-ocw":
                item["search_url"] = f"https://ocw.mit.edu/search/?q={quote_plus(query)}"
            elif provider["id"] == "udemy":
                item["search_url"] = f"https://www.udemy.com/courses/search/?q={quote_plus(query)}&price=price-free"
            elif provider["id"] == "coursera":
                item["search_url"] = f"https://www.coursera.org/search?query={quote_plus(query)}"
            elif provider["id"] == "edx":
                item["search_url"] = f"https://www.edx.org/search?q={quote_plus(query)}"
            elif provider.get("search_template"):
                item["search_url"] = provider["search_template"].format(query=source_query)
            else:
                item["search_url"] = item["url"]
        item.pop("search_template", None)
        providers.append(item)
    return {
        "query": query,
        "providers": providers,
        "categories": sorted({provider["category"] for provider in PROVIDERS}),
    }
