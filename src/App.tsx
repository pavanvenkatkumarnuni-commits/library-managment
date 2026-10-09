import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Plus, Search, Download, Upload, Pencil, Trash2, RotateCcw, ArrowUpFromLine, LibraryBig, LayoutDashboard, X, Check, BookMarked, Users, Moon, Sun, AlertTriangle, LogOut, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { checkLibraryApi, fetchLibraryState, isApiConfigured, saveLibraryState } from './api';

type Status = 'Available' | 'Issued';
type Book = { id:string; title:string; author:string; isbn:string; category:string; status:Status; memberId:string; dueDate:string; coverUrl:string };
type Member = { id:string; name:string; email:string; phone:string; joinedAt:string; studentId:string; department:string; program:string };
type Role = 'Admin' | 'Staff' | 'Student';
type Activity = { id:string; at:string; text:string; kind:string };
type Backup = { app:string; version:number; exportedAt:string; books:Book[]; members:Member[]; dark:boolean; activity?:Activity[] };
const BOOKS_KEY='libraryhub.books.v3', MEMBERS_KEY='libraryhub.members.v2', THEME_KEY='libraryhub.dark.v2', LOGIN_KEY='libraryhub.demo-session.v2', ROLE_KEY='libraryhub.demo-role.v2', ACTIVITY_KEY='libraryhub.activity.v2';
const sampleBooks:Book[]=[
{id:'b1',title:'Atomic Habits',author:'James Clear',isbn:'9780735211292',category:'Self Development',status:'Available',memberId:'',dueDate:'',coverUrl:'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg'},
{id:'b2',title:'The Alchemist',author:'Paulo Coelho',isbn:'9780061122415',category:'Fiction',status:'Issued',memberId:'m1',dueDate:'2026-10-08',coverUrl:'https://covers.openlibrary.org/b/isbn/9780061122415-M.jpg'},
{id:'b3',title:'Ikigai',author:'Héctor García & Francesc Miralles',isbn:'9780143130727',category:'Lifestyle',status:'Available',memberId:'',dueDate:'',coverUrl:'https://covers.openlibrary.org/b/isbn/9780143130727-M.jpg'},
{id:'b4',title:'Clean Code',author:'Robert C. Martin',isbn:'9780132350884',category:'Technology',status:'Available',memberId:'',dueDate:'',coverUrl:'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg'},
{id:'b5',title:'Wings of Fire',author:'A. P. J. Abdul Kalam',isbn:'9788173711466',category:'Biography',status:'Issued',memberId:'m2',dueDate:'2026-10-14',coverUrl:'https://covers.openlibrary.org/b/isbn/9788173711466-M.jpg'}];
const additionalBookData:[string,string,string,string][]=[
  [
    "The Great Gatsby",
    "F. Scott Fitzgerald",
    "9780743273565",
    "Fiction"
  ],
  [
    "To Kill a Mockingbird",
    "Harper Lee",
    "9780060935467",
    "Fiction"
  ],
  [
    "1984",
    "George Orwell",
    "9780451524935",
    "Fiction"
  ],
  [
    "Pride and Prejudice",
    "Jane Austen",
    "9780141439518",
    "Fiction"
  ],
  [
    "The Catcher in the Rye",
    "J. D. Salinger",
    "9780316769488",
    "Fiction"
  ],
  [
    "The Hobbit",
    "J. R. R. Tolkien",
    "9780547928227",
    "Fantasy"
  ],
  [
    "The Lord of the Rings",
    "J. R. R. Tolkien",
    "9780618640157",
    "Fantasy"
  ],
  [
    "Harry Potter and the Philosopher's Stone",
    "J. K. Rowling",
    "9780590353427",
    "Fantasy"
  ],
  [
    "The Book Thief",
    "Markus Zusak",
    "9780375842207",
    "Fiction"
  ],
  [
    "The Kite Runner",
    "Khaled Hosseini",
    "9781594631931",
    "Fiction"
  ],
  [
    "A Thousand Splendid Suns",
    "Khaled Hosseini",
    "9781594489501",
    "Fiction"
  ],
  [
    "The Midnight Library",
    "Matt Haig",
    "9780525559474",
    "Fiction"
  ],
  [
    "The Silent Patient",
    "Alex Michaelides",
    "9781250301697",
    "Mystery"
  ],
  [
    "And Then There Were None",
    "Agatha Christie",
    "9780062073488",
    "Mystery"
  ],
  [
    "Murder on the Orient Express",
    "Agatha Christie",
    "9780062693662",
    "Mystery"
  ],
  [
    "The Da Vinci Code",
    "Dan Brown",
    "9780307474278",
    "Thriller"
  ],
  [
    "Angels & Demons",
    "Dan Brown",
    "9780743493468",
    "Thriller"
  ],
  [
    "Dune",
    "Frank Herbert",
    "9780441172719",
    "Science Fiction"
  ],
  [
    "Fahrenheit 451",
    "Ray Bradbury",
    "9781451673319",
    "Science Fiction"
  ],
  [
    "The Martian",
    "Andy Weir",
    "9780553418026",
    "Science Fiction"
  ],
  [
    "Sapiens",
    "Yuval Noah Harari",
    "9780062316097",
    "History"
  ],
  [
    "Homo Deus",
    "Yuval Noah Harari",
    "9780062464316",
    "History"
  ],
  [
    "Educated",
    "Tara Westover",
    "9780399590504",
    "Biography"
  ],
  [
    "Steve Jobs",
    "Walter Isaacson",
    "9781451648539",
    "Biography"
  ],
  [
    "Long Walk to Freedom",
    "Nelson Mandela",
    "9780316548182",
    "Biography"
  ],
  [
    "Wings of Fire: An Autobiography",
    "A. P. J. Abdul Kalam",
    "9788173711466",
    "Biography"
  ],
  [
    "The Diary of a Young Girl",
    "Anne Frank",
    "9780553296983",
    "Biography"
  ],
  [
    "Man's Search for Meaning",
    "Viktor E. Frankl",
    "9780807014271",
    "Psychology"
  ],
  [
    "Thinking, Fast and Slow",
    "Daniel Kahneman",
    "9780374533557",
    "Psychology"
  ],
  [
    "Deep Work",
    "Cal Newport",
    "9781455586691",
    "Self Development"
  ],
  [
    "The 7 Habits of Highly Effective People",
    "Stephen R. Covey",
    "9781982137274",
    "Self Development"
  ],
  [
    "How to Win Friends and Influence People",
    "Dale Carnegie",
    "9780671027032",
    "Self Development"
  ],
  [
    "Mindset",
    "Carol S. Dweck",
    "9780345472328",
    "Psychology"
  ],
  [
    "Grit",
    "Angela Duckworth",
    "9781501111105",
    "Psychology"
  ],
  [
    "The Power of Now",
    "Eckhart Tolle",
    "9781577314806",
    "Self Development"
  ],
  [
    "Start with Why",
    "Simon Sinek",
    "9781591846444",
    "Business"
  ],
  [
    "Good to Great",
    "Jim Collins",
    "9780066620992",
    "Business"
  ],
  [
    "The Lean Startup",
    "Eric Ries",
    "9780307887894",
    "Business"
  ],
  [
    "Zero to One",
    "Peter Thiel",
    "9780804139298",
    "Business"
  ],
  [
    "The Psychology of Money",
    "Morgan Housel",
    "9780857197689",
    "Finance"
  ],
  [
    "Rich Dad Poor Dad",
    "Robert T. Kiyosaki",
    "9781612680194",
    "Finance"
  ],
  [
    "The Intelligent Investor",
    "Benjamin Graham",
    "9780060555665",
    "Finance"
  ],
  [
    "A Brief History of Time",
    "Stephen Hawking",
    "9780553380163",
    "Science"
  ],
  [
    "Cosmos",
    "Carl Sagan",
    "9780345539434",
    "Science"
  ],
  [
    "The Selfish Gene",
    "Richard Dawkins",
    "9780199291151",
    "Science"
  ],
  [
    "The Gene",
    "Siddhartha Mukherjee",
    "9781476733500",
    "Science"
  ],
  [
    "The Code Book",
    "Simon Singh",
    "9780385495325",
    "Technology"
  ],
  [
    "The Pragmatic Programmer",
    "Andrew Hunt & David Thomas",
    "9780135957059",
    "Technology"
  ],
  [
    "Design Patterns",
    "Erich Gamma et al.",
    "9780201633610",
    "Technology"
  ],
  [
    "Introduction to Algorithms",
    "Thomas H. Cormen et al.",
    "9780262046305",
    "Technology"
  ],
  [
    "Artificial Intelligence: A Modern Approach",
    "Stuart Russell & Peter Norvig",
    "9780134610993",
    "Technology"
  ],
  [
    "Computer Networking: A Top-Down Approach",
    "James Kurose & Keith Ross",
    "9780136681557",
    "Technology"
  ],
  [
    "Operating System Concepts",
    "Abraham Silberschatz et al.",
    "9781119800361",
    "Technology"
  ],
  [
    "Database System Concepts",
    "Abraham Silberschatz et al.",
    "9780078022159",
    "Technology"
  ],
  [
    "The Art of Computer Programming, Vol. 1",
    "Donald E. Knuth",
    "9780201896831",
    "Technology"
  ],
  [
    "Eloquent JavaScript",
    "Marijn Haverbeke",
    "9781593279509",
    "Technology"
  ],
  [
    "You Don't Know JS Yet",
    "Kyle Simpson",
    "9781098128732",
    "Technology"
  ],
  [
    "Learning Python",
    "Mark Lutz",
    "9781449355739",
    "Technology"
  ],
  [
    "Clean Architecture",
    "Robert C. Martin",
    "9780134494166",
    "Technology"
  ],
  [
    "Refactoring",
    "Martin Fowler",
    "9780134757599",
    "Technology"
  ],
  [
    "The Design of Everyday Things",
    "Don Norman",
    "9780465050659",
    "Design"
  ],
  [
    "Don't Make Me Think",
    "Steve Krug",
    "9780321965516",
    "Design"
  ],
  [
    "The Elements of Style",
    "William Strunk Jr. & E. B. White",
    "9780205309023",
    "Writing"
  ],
  [
    "On Writing",
    "Stephen King",
    "9781439156810",
    "Writing"
  ],
  [
    "The Oxford English Dictionary",
    "Oxford University Press",
    "9780198611868",
    "Reference"
  ],
  [
    "A Short History of Nearly Everything",
    "Bill Bryson",
    "9780767908184",
    "Science"
  ],
  [
    "The Immortal Life of Henrietta Lacks",
    "Rebecca Skloot",
    "9781400052189",
    "Science"
  ],
  [
    "The Sixth Extinction",
    "Elizabeth Kolbert",
    "9781250062185",
    "Science"
  ],
  [
    "Silent Spring",
    "Rachel Carson",
    "9780618249060",
    "Environment"
  ],
  [
    "The Hidden Life of Trees",
    "Peter Wohlleben",
    "9781771642484",
    "Environment"
  ],
  [
    "Guns, Germs, and Steel",
    "Jared Diamond",
    "9780393354324",
    "History"
  ],
  [
    "India After Gandhi",
    "Ramachandra Guha",
    "9780060198817",
    "History"
  ],
  [
    "The Discovery of India",
    "Jawaharlal Nehru",
    "9780143031031",
    "History"
  ],
  [
    "The Argumentative Indian",
    "Amartya Sen",
    "9780141012117",
    "History"
  ],
  [
    "The White Tiger",
    "Aravind Adiga",
    "9781416562603",
    "Fiction"
  ],
  [
    "The God of Small Things",
    "Arundhati Roy",
    "9780812979657",
    "Fiction"
  ],
  [
    "Train to Pakistan",
    "Khushwant Singh",
    "9780143065883",
    "Fiction"
  ],
  [
    "Malgudi Days",
    "R. K. Narayan",
    "9788185986172",
    "Fiction"
  ],
  [
    "The Guide",
    "R. K. Narayan",
    "9780143039648",
    "Fiction"
  ],
  [
    "Midnight's Children",
    "Salman Rushdie",
    "9780812976533",
    "Fiction"
  ],
  [
    "The Palace of Illusions",
    "Chitra Banerjee Divakaruni",
    "9781400096893",
    "Fiction"
  ],
  [
    "The Namesake",
    "Jhumpa Lahiri",
    "9780618485222",
    "Fiction"
  ],
  [
    "Interpreter of Maladies",
    "Jhumpa Lahiri",
    "9780395927205",
    "Fiction"
  ],
  [
    "The Blue Umbrella",
    "Ruskin Bond",
    "9788171673407",
    "Fiction"
  ],
  [
    "The Room on the Roof",
    "Ruskin Bond",
    "9780143333389",
    "Fiction"
  ],
  [
    "The Complete Stories",
    "Rabindranath Tagore",
    "9780140448069",
    "Fiction"
  ],
  [
    "Gitanjali",
    "Rabindranath Tagore",
    "9780143039648",
    "Poetry"
  ],
  [
    "The Republic",
    "Plato",
    "9780140449143",
    "Philosophy"
  ],
  [
    "Meditations",
    "Marcus Aurelius",
    "9780812968255",
    "Philosophy"
  ],
  [
    "The Art of War",
    "Sun Tzu",
    "9781590302255",
    "Philosophy"
  ],
  [
    "Letters from a Stoic",
    "Seneca",
    "9780140442106",
    "Philosophy"
  ],
  [
    "The Little Prince",
    "Antoine de Saint-Exupéry",
    "9780156012195",
    "Fiction"
  ],
  [
    "Charlotte's Web",
    "E. B. White",
    "9780064400558",
    "Children"
  ],
  [
    "Matilda",
    "Roald Dahl",
    "9780142410370",
    "Children"
  ],
  [
    "The Adventures of Tom Sawyer",
    "Mark Twain",
    "9780486400778",
    "Children"
  ]
];
const expandedSampleBooks:Book[]=[...sampleBooks,...additionalBookData.map(([title,author,isbn,category],i)=>({id:'seed-'+String(i+6).padStart(3,'0'),title,author,isbn,category,status:'Available' as Status,memberId:'',dueDate:'',coverUrl:'https://covers.openlibrary.org/b/isbn/'+isbn+'-M.jpg'}))];
const CATALOG_SEED_KEY='libraryhub.catalog-seeded.v1';
const sampleMembers:Member[]=[
{id:'m1',name:'Aarav Sharma',email:'aarav@example.com',phone:'',joinedAt:'2026-09-10',studentId:'CSE2026001',department:'Computer Science',program:'B.Tech'},
{id:'m2',name:'Priya Reddy',email:'priya@example.com',phone:'',joinedAt:'2026-09-12',studentId:'ECE2026002',department:'Electronics',program:'B.Tech'},
{id:'m3',name:'Rohan Kumar',email:'rohan@example.com',phone:'',joinedAt:'2026-09-15',studentId:'MBA2026003',department:'Management',program:'MBA'}];
const blankBook:Omit<Book,'id'>={title:'',author:'',isbn:'',category:'Fiction',status:'Available',memberId:'',dueDate:'',coverUrl:''};
const blankMember:Omit<Member,'id'>={name:'',email:'',phone:'',joinedAt:new Date().toISOString().slice(0,10),studentId:'',department:'',program:''};
function read<T,>(key:string,fallback:T):T{try{const x=localStorage.getItem(key);if(x!==null)return JSON.parse(x) as T;}catch{}return fallback;}
function isOverdue(b:Book){return b.status==='Issued'&&!!b.dueDate&&b.dueDate<new Date().toISOString().slice(0,10);}
function id(){return globalThis.crypto?.randomUUID?.()??String(Date.now())+Math.random().toString(36).slice(2);}
export default function App(){
 const [books,setBooks]=useState<Book[]>(()=>read(BOOKS_KEY,[]));
 useEffect(()=>{try{if(localStorage.getItem(CATALOG_SEED_KEY)!=='yes'){const current=read<Book[]>(BOOKS_KEY,[]);const known=new Set(current.map(b=>b.id));const seeded=expandedSampleBooks.filter(b=>!known.has(b.id));if(current.length===0){setBooks(expandedSampleBooks);}else if(seeded.length){setBooks([...current,...seeded]);}localStorage.setItem(CATALOG_SEED_KEY,'yes');}}catch{}},[]);
 const [members,setMembers]=useState<Member[]>(()=>read(MEMBERS_KEY,[]));
 useEffect(()=>{try{if(localStorage.getItem('libraryhub.demo-students-seeded.v1')==='yes')return;const current=read<Member[]>(MEMBERS_KEY,[]);if(current.length===0)setMembers(sampleMembers.map(m=>({...m})));localStorage.setItem('libraryhub.demo-students-seeded.v1','yes');}catch{}},[]);
 useEffect(()=>{try{if(localStorage.getItem('libraryhub.repair-orphan-loans.v1')==='yes')return;const currentBooks=read<Book[]>(BOOKS_KEY,[]);const currentMembers=read<Member[]>(MEMBERS_KEY,[]);const memberIds=new Set(currentMembers.map(m=>m.id));const repaired=currentBooks.map(b=>b.status==='Issued'&&(!b.memberId||!memberIds.has(b.memberId))?{...b,status:'Available' as Status,memberId:'',dueDate:''}:b);if(repaired.some((b,i)=>b!==currentBooks[i]))setBooks(repaired);localStorage.setItem('libraryhub.repair-orphan-loans.v1','yes');}catch{}},[]);
 const [dark,setDark]=useState<boolean>(()=>read(THEME_KEY,false));
 const [signedIn,setSignedIn]=useState<boolean>(()=>false);
 const [role,setRole]=useState<Role>(()=>read<Role>(ROLE_KEY,'Admin'));
 const [activity,setActivity]=useState<Activity[]>(()=>read<Activity[]>(ACTIVITY_KEY,[]));
 const [showNotifications,setShowNotifications]=useState(false);
 const [portalMember,setPortalMember]=useState('');
 const [currentStudentId,setCurrentStudentId]=useState('');
 const [view,setView]=useState('Dashboard'),[query,setQuery]=useState(''),[filter,setFilter]=useState('All');
 const [bookModal,setBookModal]=useState(false),[memberModal,setMemberModal]=useState(false),[editing,setEditing]=useState<string|null>(null),[editingMember,setEditingMember]=useState<string|null>(null);
 const [draft,setDraft]=useState({...blankBook}),[memberDraft,setMemberDraft]=useState({...blankMember}),[toast,setToast]=useState(''),[loginName,setLoginName]=useState('Admin'),[loginPassword,setLoginPassword]=useState('');
 const fileRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{localStorage.setItem(BOOKS_KEY,JSON.stringify(books));localStorage.setItem(MEMBERS_KEY,JSON.stringify(members));localStorage.setItem(THEME_KEY,JSON.stringify(dark));localStorage.setItem(ACTIVITY_KEY,JSON.stringify(activity));localStorage.setItem(ROLE_KEY,JSON.stringify(role));}catch{setToast('Browser storage is full. Export a backup and use smaller cover images.');}},[books,members,dark,activity,role]);
 const apiReady=useRef(false);
 const [apiStatus,setApiStatus]=useState<'local'|'connecting'|'online'|'offline'>(isApiConfigured()?'connecting':'local');
 useEffect(()=>{let active=true;if(!isApiConfigured()){apiReady.current=true;return;}setApiStatus('connecting');(async()=>{try{const [healthy,remote]=await Promise.all([checkLibraryApi(),fetchLibraryState()]);if(!active)return;setApiStatus(healthy?'online':'offline');if(remote&&(remote.books.length>0||remote.members.length>0)){setBooks(remote.books as Book[]);setMembers(remote.members as Member[]);}apiReady.current=true;}catch{if(active){setApiStatus('offline');apiReady.current=true;}}})();return()=>{active=false;};},[]);
 useEffect(()=>{if(!isApiConfigured()||!apiReady.current)return;const timer=window.setTimeout(()=>{saveLibraryState({books,members,activity}).then(()=>setApiStatus('online')).catch(()=>setApiStatus('offline'));},450);return()=>window.clearTimeout(timer);},[books,members,activity]);
 const available=books.filter(b=>b.status==='Available').length, issued=books.length-available, overdue=books.filter(isOverdue).length;
 const memberFor=(book:Book)=>members.find(m=>m.id===book.memberId);
 const visibleBooks=useMemo(()=>books.filter(b=>[b.title,b.author,b.isbn,b.category,memberFor(b)?.name].join(' ').toLowerCase().includes(query.toLowerCase())&&(filter==='All'||b.status===filter)&&(view!=='Issued books'||b.status==='Issued')&&(view!=='Overdue'||isOverdue(b))),[books,members,query,filter,view]);
 const visibleMembers=useMemo(()=>members.filter(m=>[m.name,m.email,m.phone].join(' ').toLowerCase().includes(query.toLowerCase())),[members,query]);
 function notify(s:string){setToast(s);window.setTimeout(()=>setToast(v=>v===s?'':v),3200);}
 function logActivity(text:string,kind='system'){setActivity(xs=>[{id:id(),at:new Date().toISOString(),text,kind},...xs].slice(0,100));}
 const notifications=useMemo(()=>[{id:'overdue',title:overdue+' overdue '+(overdue===1?'book':'books'),detail:'Review loans that passed their due date.',warning:true},...activity.slice(0,8).map(a=>({id:a.id,title:a.text,detail:new Date(a.at).toLocaleString(),warning:false}))],[overdue,activity]);
 function exportCsv(){const rows=[['Title','Author','ISBN','Category','Status','Member','Due date','Overdue'],...books.map(b=>[b.title,b.author,b.isbn,b.category,b.status,memberFor(b)?.name||'',b.dueDate,isOverdue(b)?'Yes':'No'])];const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\\r\\n');const url=URL.createObjectURL(new Blob(['\\ufeff'+csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='libraryhub-books.csv';a.click();URL.revokeObjectURL(url);notify('Catalogue CSV exported.');}
 function renewLoan(b:Book){if(b.status!=='Issued')return;const date=new Date((b.dueDate||new Date().toISOString().slice(0,10))+'T12:00:00');date.setDate(date.getDate()+14);const dueDate=date.toISOString().slice(0,10);setBooks(xs=>xs.map(x=>x.id===b.id?{...x,dueDate}:x));logActivity('Renewed '+b.title+'; new due date '+dueDate,'loan');notify('Loan renewed for 14 days.');}
 function addBook(){setEditing(null);setDraft({...blankBook});setBookModal(true);}
 function editBook(b:Book){setEditing(b.id);setDraft({title:b.title,author:b.author,isbn:b.isbn,category:b.category,status:b.status,memberId:b.memberId,dueDate:b.dueDate,coverUrl:b.coverUrl});setBookModal(true);}
 function saveBook(e:React.FormEvent){e.preventDefault();if(!draft.title.trim()||!draft.author.trim())return;if(draft.status==='Issued'&&!draft.memberId){notify('Choose a registered member before issuing a book.');return;}if(draft.status==='Issued'&&!draft.dueDate){notify('Choose a due date for this loan.');return;}const clean={...draft,title:draft.title.trim(),author:draft.author.trim(),isbn:draft.isbn.trim(),memberId:draft.status==='Issued'?draft.memberId:'',dueDate:draft.status==='Issued'?draft.dueDate:'',coverUrl:draft.coverUrl.trim()};if(clean.isbn&&books.some(b=>b.isbn===clean.isbn&&b.id!==editing)){notify('A book with this ISBN already exists.');return;}if(editing){setBooks(xs=>xs.map(b=>b.id===editing?{...b,...clean}:b));logActivity('Updated book: '+clean.title,'book');notify('Book updated.');}else{setBooks(xs=>[{...clean,id:id()},...xs]);logActivity('Added book: '+clean.title,'book');notify('Book added to catalogue.');}setBookModal(false);}
 function startIssue(b:Book){if(b.status==='Issued'){if(confirm('Mark this book as returned?')){setBooks(xs=>xs.map(x=>x.id===b.id?{...x,status:'Available',memberId:'',dueDate:''}:x));logActivity('Returned '+b.title+' from '+(memberFor(b)?.name||'member'),'loan');notify('Book returned successfully.');}return;}setEditing(b.id);setDraft({...b,status:'Issued',memberId:'',dueDate:new Date(Date.now()+14*86400000).toISOString().slice(0,10)});setBookModal(true);}
 function deleteBook(b:Book){if(role!=='Admin'){notify('Only an admin can delete books.');return;}if(confirm('Delete “'+b.title+'” from the catalogue?')){setBooks(xs=>xs.filter(x=>x.id!==b.id));logActivity('Deleted book: '+b.title,'book');notify('Book deleted.');}}
 function addMember(){setEditingMember(null);setMemberDraft({...blankMember,joinedAt:new Date().toISOString().slice(0,10)});setMemberModal(true);}
 function editMember(m:Member){setEditingMember(m.id);setMemberDraft({name:m.name,email:m.email,phone:m.phone,joinedAt:m.joinedAt,studentId:m.studentId||'',department:m.department||'',program:m.program||''});setMemberModal(true);}
 function saveMember(e:React.FormEvent){e.preventDefault();if(!memberDraft.name.trim())return;const clean={...memberDraft,name:memberDraft.name.trim(),email:memberDraft.email.trim(),phone:memberDraft.phone.trim()};if(clean.email&&members.some(m=>m.email.toLowerCase()===clean.email.toLowerCase()&&m.id!==editingMember)){notify('A member with this email already exists.');return;}if(clean.studentId&&members.some(m=>(m.studentId||'').toLowerCase()===clean.studentId!.toLowerCase()&&m.id!==editingMember)){notify('This campus ID is already registered.');return;}if(editingMember){setMembers(xs=>xs.map(m=>m.id===editingMember?{...m,...clean}:m));logActivity('Updated member: '+clean.name,'member');notify('Member updated.');}else{setMembers(xs=>[{...clean,id:id()},...xs]);logActivity('Registered member: '+clean.name,'member');notify('Member added.');}setMemberModal(false);}
 function deleteMember(m:Member){if(role!=='Admin'){notify('Only an admin can remove members.');return;}if(books.some(b=>b.status==='Issued'&&b.memberId===m.id)){notify('Return this member’s issued books before removing them.');return;}if(confirm('Remove member '+m.name+'?')){setMembers(xs=>xs.filter(x=>x.id!==m.id));logActivity('Removed member: '+m.name,'member');notify('Member removed.');}}
 function exportData(){const backup:Backup={app:'LibraryHub',version:3,exportedAt:new Date().toISOString(),books,members,dark,activity};const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='libraryhub-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);notify('Full backup downloaded. Keep a copy outside this browser.');}
 function restoreData(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const p=JSON.parse(String(reader.result));const nextBooks=Array.isArray(p)?p:p.books;const nextMembers=Array.isArray(p.members)?p.members:[];if(!Array.isArray(nextBooks)||!nextBooks.every((b:any)=>b&&typeof b.id==='string'&&typeof b.title==='string'&&typeof b.author==='string'&&['Available','Issued'].includes(b.status)))throw Error('bad books');if(!nextMembers.every((m:any)=>m&&typeof m.id==='string'&&typeof m.name==='string'))throw Error('bad members');if(confirm('Restore '+nextBooks.length+' books and '+nextMembers.length+' members? This replaces current browser records. Export a backup first if needed.')){setBooks(nextBooks.map((b:any)=>({...blankBook,...b,memberId:typeof b.memberId==='string'?b.memberId:''})));setMembers(nextMembers);if(Array.isArray(p.activity))setActivity(p.activity);if(typeof p.dark==='boolean')setDark(p.dark);logActivity('Restored a library backup','system');notify('Backup restored successfully.');}}catch{notify('That file is not a valid LibraryHub backup.');}if(fileRef.current)fileRef.current.value='';};reader.readAsText(f);}
 function signIn(e:React.FormEvent){e.preventDefault();const account=loginName.trim().toLowerCase();if(loginPassword==='student123'){const student=members.find(m=>(m.studentId||'').trim().toLowerCase()===account||m.email.trim().toLowerCase()===account);if(!student){notify('Student not found. Use a registered campus ID or email, or ask staff to register you.');return;}setCurrentStudentId(student.id);setRole('Student');setView('Student home');setSignedIn(true);logActivity('Student portal sign in: '+student.name,'member');notify('Welcome back, '+student.name+'.');return;}const nextRole:Role=loginPassword==='library123'?'Admin':'Staff';if(loginPassword!=='library123'&&loginPassword!=='staff123'){notify('Use library123 for Admin, staff123 for Staff, or student123 for a registered student.');return;}localStorage.setItem(LOGIN_KEY,'true');localStorage.setItem(ROLE_KEY,JSON.stringify(nextRole));setRole(nextRole);setCurrentStudentId('');setView('Dashboard');setSignedIn(true);logActivity('Signed in as '+nextRole);notify('Welcome to LibraryHub, '+nextRole+'.');}
 const categoryData=useMemo(()=>{const counts=new Map<string,number>();books.forEach(b=>counts.set(b.category||'Other',(counts.get(b.category||'Other')||0)+1));return Array.from(counts,([name,count])=>({name,count}));},[books]);
 const loanData=[{name:'Available',value:available},{name:'Issued',value:issued}];
 function borrowForStudent(book:Book){if(role!=='Student'||!currentStudentId)return;if(book.status!=='Available'){notify('This title is currently on loan.');return;}const active=books.filter(b=>b.status==='Issued'&&b.memberId===currentStudentId).length;if(active>=5){notify('Student borrowing limit reached (5 active books).');return;}const due=new Date();due.setDate(due.getDate()+14);const dueDate=due.toISOString().slice(0,10);setBooks(xs=>xs.map(b=>b.id===book.id&&b.status==='Available'?{...b,status:'Issued',memberId:currentStudentId,dueDate}:b));logActivity('Student borrowed '+book.title+' · due '+dueDate,'loan');notify('Borrowed “'+book.title+'”. Due '+dueDate+'.');}
 function loadDemoLibrary(){if(!confirm('Load a demo college library? This replaces the current books and members in this browser. Export a backup first if you need to keep existing records.'))return;setBooks(sampleBooks.map(b=>({...b})));setMembers(sampleMembers.map(m=>({...m})));setPortalMember('');logActivity('Loaded the LibraryHub demo college collection','system');notify('Demo collection loaded. Explore the catalogue, lending and reports.');}
 if(!signedIn)return <div className={`launch-screen ${dark?'dark':''}`}>
 <div className="launch-noise" aria-hidden="true"/><div className="launch-orb orb-one"/><div className="launch-orb orb-two"/><div className="launch-orb orb-three"/>
 <nav className="launch-nav"><a className="launch-brand" href="#home" aria-label="LibraryHub home"><span className="launch-mark"><LibraryBig size={23}/></span><span><b>LibraryHub</b><small>CAMPUS EDITION</small></span></a><div className="launch-nav-right"><span className="launch-status"><i/> LOCAL-FIRST WORKSPACE</span><button type="button" className="launch-theme" onClick={()=>setDark(x=>!x)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button></div></nav>
 <main className="launch-main" id="home"><section className="launch-story"><div className="launch-kicker"><span/> THE NEXT CHAPTER OF YOUR LIBRARY</div><h1>Make room for<br/><em>big ideas.</em></h1><p className="launch-copy">A beautifully organised home for your campus collection. Track every title, every borrower, and every due date — without the admin chaos.</p><div className="launch-actions"><a className="launch-cta" href="#sign-in">Enter your workspace <span>↗</span></a><span className="launch-note"><Check size={14}/> Free to run · Your data stays in this browser</span></div><div className="launch-feature-row"><span><BookOpen size={15}/> Smart catalogue</span><span><Users size={15}/> Campus members</span><span><BarChart3 size={15}/> Live insights</span></div><div className="launch-microcopy">DESIGNED FOR COLLEGE LIBRARIES <b>·</b> BUILT FOR WHAT'S NEXT</div></section>
 <section className="launch-visual" aria-label="Animated LibraryHub preview"><div className="visual-grid"/><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="floating-book book-float-one"><span className="mini-cover cover-coral"><BookOpen size={21}/></span><span><b>Ideas that last</b><small>FEATURED COLLECTION</small></span><span className="mini-arrow">↗</span></div><div className="floating-book book-float-two"><span className="mini-cover cover-mint"><BookMarked size={20}/></span><span><b>Campus reads</b><small>YOUR NEXT DISCOVERY</small></span></div><div className="launch-core"><div className="core-ring ring-one"/><div className="core-ring ring-two"/><div className="core-book"><LibraryBig size={62} strokeWidth={1.3}/></div><span className="core-spark spark-one">✳</span><span className="core-spark spark-two">✦</span></div><div className="floating-stat stat-top"><span className="stat-pulse"/> A FRESH START <b>01</b></div><div className="floating-stat stat-bottom"><span className="stat-bars"><i/><i/><i/><i/></span><span><b>One calm workspace</b><small>Books, members, lending & reports</small></span></div></section></main>
 <section className="launch-login-wrap" id="sign-in"><div className="launch-login-intro"><span className="launch-kicker"><span/> YOUR LIBRARY, YOUR WAY</span><h2>Step inside.</h2><p>Sign in to open your workspace. New libraries start with a clean catalogue — add your own books and members when you're ready.</p><div className="login-perks"><span><Check size={15}/> Browse and borrow campus books</span><span><Check size={15}/> Personal loan and due-date tracking</span><span><Check size={15}/> Separate Admin, Staff & Student views</span></div></div><form className="launch-login-card" onSubmit={signIn}><div className="login-card-top"><span className="login-symbol"><LogOut size={18}/></span><span><b>Workspace sign in</b><small>Use your demo account to continue</small></span><span className="secure-dot"/></div><label>Username<input value={loginName} onChange={e=>setLoginName(e.target.value)} required autoComplete="username" placeholder="Admin or Staff"/></label><label>Password<input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter demo password"/></label><button className="launch-submit" type="submit">Open LibraryHub <span>→</span></button><div className="demo-accounts"><span>DEMO ACCESS</span><button type="button" onClick={()=>{setLoginName('Admin');setLoginPassword('library123')}}>Admin <small>library123</small></button><button type="button" onClick={()=>{setLoginName('Staff');setLoginPassword('staff123')}}>Staff <small>staff123</small></button></div><button type="button" className="student-demo-button" onClick={()=>{setLoginName(members[0]?.studentId||'CSE2026001');setLoginPassword('student123')}}>Student demo · {members[0]?.studentId||'CSE2026001'} / student123</button><small className="demo-warning">Demo-only sign in. Student ID/email + student123. Not secure authentication.</small></form></section>
 <footer className="launch-footer"><span>© 2026 LIBRARYHUB <b>·</b> COLLEGE LIBRARY EDITION</span><span>LESS CLUTTER. MORE DISCOVERY. <i>✳</i></span></footer>{showNotifications&&<div className="notification-popover"><div className="notification-head"><b>Notifications</b><button className="x" onClick={()=>setShowNotifications(false)}><X size={15}/></button></div>{notifications.length?notifications.slice(0,10).map(n=><button className="notification-item" key={n.id} onClick={()=>{if(n.id==='overdue')setView('Overdue');setShowNotifications(false)}}><span className={n.warning?'notification-warning':'notification-check'}>{n.warning?<AlertTriangle size={15}/>:<Check size={15}/>}</span><span><b>{n.title}</b><small>{n.detail}</small></span></button>):<div className="notification-empty">You're all caught up.</div>}</div>}{toast&&<div className="toast"><Check size={17}/>{toast}<button onClick={()=>setToast('')}><X size={15}/></button></div>}</div>;
 return <div className={`layout ${dark?'dark':''}`}><aside className="sidebar"><div className="brand"><span className="brand-icon"><LibraryBig/></span><span><b>LibraryHub</b><small>SMART LIBRARY MANAGER</small></span></div><p className="label">WORKSPACE</p>{(role==='Student'?[['Student home',LayoutDashboard],['Browse books',BookOpen],['My loans',BookMarked]]:[['Dashboard',LayoutDashboard],['All books',BookOpen],['Issued books',ArrowUpFromLine],['Overdue',AlertTriangle],['Members',Users],['Member portal',BookMarked],['Reports',BarChart3]]).map(([v,Icon]:any)=><button key={v} className={`nav ${view===v?'selected':''}`} onClick={()=>{setView(v);setQuery('');setFilter('All')}}><Icon size={17}/>{v}{v==='Issued books'&&<em>{issued}</em>}{v==='Overdue'&&<em className="overdue-count">{overdue}</em>}</button>)}<div className="sidebar-tip"><BookMarked/><b>Your library at a glance</b><p>{books.length} books · {members.length} members · {overdue} overdue</p><button onClick={exportData}>Back up library ↓</button></div><small className="local">● Saved in this browser</small></aside>
 <main><header><div><span>Workspace</span>　/　<b>{view}</b></div><div className="header-actions"><button className="icon-button notification-trigger" title="Notifications" onClick={()=>setShowNotifications(x=>!x)}><AlertTriangle size={17}/>{notifications.length>0&&<i className="notification-dot"/>}</button><button className="icon-button" title={dark?'Switch to light mode':'Switch to dark mode'} onClick={()=>setDark(x=>!x)}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button><span className="badge">{role} · {apiStatus==='online'?'API connected':apiStatus==='connecting'?'Connecting…':apiStatus==='offline'?'API offline':'Local data'}</span><button className="icon-button" title="Sign out" onClick={()=>{localStorage.removeItem(LOGIN_KEY);localStorage.removeItem(ROLE_KEY);setCurrentStudentId('');setRole('Admin');setView('Dashboard');setSignedIn(false);setLoginPassword('')}}><LogOut size={16}/></button></div></header><section className="content">
 <div className="intro"><div><p className="eyebrow">YOUR LIBRARY, ORGANIZED</p><h1>{view==='Student home'?'Student home':view==='Browse books'?'Browse books':view==='My loans'?'My loans':view==='Dashboard'?`Good to see you, ${role}`:view==='Issued books'?'Issued books':view==='Overdue'?'Overdue books':view==='Members'?'Member management':'Book catalogue'}<i>.</i></h1><p className="sub">{role==='Student'?'Browse campus books and manage your own loans.':'Manage your collection, track loans, and keep every reader organized.'}</p></div>{role!=='Student'&&(view==='Members'?<button className="primary" onClick={addMember}><Plus size={17}/> Add member</button>:<button className="primary" onClick={addBook}><Plus size={17}/> Add book</button>)}</div>
 {view==='Dashboard'&&<><section className="dashboard-hero"><div className="dashboard-hero-copy"><span className="hero-eyebrow"><i/> CAMPUS LIBRARY · LIVE OVERVIEW</span><h2>Your collection, <em>in motion.</em></h2><p>A clearer view of what’s on your shelves, what’s out in the world, and what needs your attention.</p><div className="hero-actions"><button className="hero-primary" onClick={addBook}><Plus size={15}/> Add a title</button><button className="hero-secondary" onClick={()=>setView('Members')}><Users size={15}/> Manage members</button></div></div><div className="hero-art" aria-hidden="true"><span className="hero-orbit hero-orbit-one"/><span className="hero-orbit hero-orbit-two"/><span className="hero-book hero-book-one"><BookOpen size={26}/></span><span className="hero-book hero-book-two"><BookMarked size={23}/></span><span className="hero-spark hero-spark-one">✳</span><span className="hero-spark hero-spark-two">✦</span><span className="hero-art-caption">READ · LEARN · GROW</span></div></section><div className="stats"><article><span className="stat-icon blue"><BookOpen/></span><p>Total books</p><strong>{books.length}</strong><small>In your catalogue</small></article><article><span className="stat-icon green"><Check/></span><p>Available</p><strong>{available}</strong><small>Ready to borrow</small></article><article><span className="stat-icon orange"><ArrowUpFromLine/></span><p>Currently issued</p><strong>{issued}</strong><small>With readers</small></article><article><span className="stat-icon purple"><Users/></span><p>Members</p><strong>{members.length}</strong><small>Registered readers</small></article></div><div className="charts"><section className="panel chart-panel"><h2><BarChart3 size={17}/> Collection by category</h2>{books.length===0?<div className="chart-empty"><span className="chart-empty-icon"><BarChart3 size={22}/></span><b>Your collection starts here</b><p>Add a few titles and this chart will show your category mix.</p><div><button className="primary small" onClick={addBook}><Plus size={14}/> Add first book</button><button className="secondary small" onClick={loadDemoLibrary}>Explore demo data</button></div></div>:<div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}} interval={0} angle={-15} textAnchor="end" height={55}/><YAxis allowDecimals={false} tick={{fontSize:10}}/><Tooltip/><Bar dataKey="count" name="Books" fill="#3477ee" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>}</section><section className="panel chart-panel"><h2><BarChart3 size={17}/> Availability</h2>{books.length===0?<div className="chart-empty availability-empty"><span className="empty-donut"><span/></span><b>No circulation data yet</b><p>Issue a book to a registered member to start tracking availability.</p><button className="secondary small" onClick={()=>setView('All books')}>Open catalogue <span>→</span></button></div>:<div className="chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={loanData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={85} paddingAngle={4}>{loanData.map((x,i)=><Cell key={x.name} fill={i===0?'#26b887':'#e9a23b'}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>}<div className="chart-legend"><span>● Available: {available}</span><span>● Issued: {issued}</span></div></section></div>{books.length===0&&<section className="empty-library-panel"><div className="empty-library-symbol"><LibraryBig size={24}/></div><div><b>Your campus library is ready for its first titles.</b><p>Start with your own catalogue, or load example books and members to explore the full workflow.</p></div><div className="empty-library-actions"><button className="primary small" onClick={addBook}><Plus size={14}/> Add a book</button><button className="secondary small" onClick={loadDemoLibrary}>Load demo library</button></div></section>}{overdue>0&&<button className="warning-banner" onClick={()=>setView('Overdue')}><AlertTriangle size={18}/><span><b>{overdue} overdue {overdue===1?'book':'books'}</b><small>Review loans and contact members.</small></span><span>View overdue →</span></button>}</>}
 {role==='Student'&&(view==='Student home'||view==='Browse books'||view==='My loans')?<section className="student-workspace"><div className="student-welcome"><div><span className="hero-eyebrow"><i/> CAMPUS READING SPACE</span><h2>{view==='Browse books'?'Find your next favourite.':view==='My loans'?'Your reading, in one place.':'Welcome back, '+(members.find(m=>m.id===currentStudentId)?.name.split(' ')[0]||'reader')+'.'}</h2><p>Discover available titles, borrow books, and keep every due date in view.</p></div><div className="student-orbit"><BookOpen size={48}/><span>READ · LEARN · GROW</span></div></div><div className="student-stats"><article><span>Books on loan</span><b>{books.filter(b=>b.status==='Issued'&&b.memberId===currentStudentId).length}</b></article><article><span>Available to borrow</span><b>{available}</b></article><article><span>Overdue</span><b>{books.filter(b=>b.status==='Issued'&&b.memberId===currentStudentId&&isOverdue(b)).length}</b></article></div>{view==='My loans'?<div className="student-book-grid">{books.filter(b=>b.status==='Issued'&&b.memberId===currentStudentId).map(b=><article className="student-book-card" key={b.id}><div className="student-cover">{b.coverUrl&&<img src={b.coverUrl} alt={b.title+' cover'} onError={(event) => { event.currentTarget.style.display = "none"; }}/>}</div><div className="student-book-info"><span className={'status '+(isOverdue(b)?'issued':'available')}>{isOverdue(b)?'Overdue':'On loan'}</span><h3>{b.title}</h3><p>{b.author}</p><small>Due {b.dueDate||'—'}</small><button className="secondary small" onClick={()=>renewLoan(b)}>Renew for 14 days</button></div></article>)}{!books.some(b=>b.status==='Issued'&&b.memberId===currentStudentId)&&<div className="student-empty"><BookOpen size={28}/><h3>No books borrowed yet</h3><p>Browse the catalogue and borrow an available title to see it here.</p><button className="primary" onClick={()=>setView('Browse books')}>Browse books</button></div>}</div>:<><div className="student-catalogue-heading"><div><h3>{view==='Browse books'?'Browse the catalogue':'Picked for curious minds'}</h3><p>Search titles, authors, or subjects. Limit: five active books.</p></div><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search books or authors..."/></label></div><div className="student-book-grid">{books.filter(b=>[b.title,b.author,b.category,b.isbn].join(' ').toLowerCase().includes(query.toLowerCase())&&(view==='Browse books'||b.status==='Available')).slice(0,view==='Student home'?8:books.length).map(b=><article className="student-book-card" key={b.id}><div className="student-cover">{b.coverUrl&&<img src={b.coverUrl} alt={b.title+' cover'} onError={(event) => { event.currentTarget.style.display = "none"; }}/>}</div><div className="student-book-info"><span className={'status '+b.status.toLowerCase()}>{b.status==='Available'?'Available':'Currently borrowed'}</span><h3>{b.title}</h3><p>{b.author}</p><small>{b.category}</small><button className={b.status==='Available'?'primary small':'secondary small'} disabled={b.status!=='Available'} onClick={()=>borrowForStudent(b)}>{b.status==='Available'?'Borrow this book':'Not available'}</button></div></article>)}{!books.some(b=>[b.title,b.author,b.category,b.isbn].join(' ').toLowerCase().includes(query.toLowerCase())&&(view==='Browse books'||b.status==='Available'))&&<div className="student-empty"><BookOpen/><h3>No matching titles</h3><p>Try a different search.</p></div>}</div><div className="student-footer-actions"><button className="secondary" onClick={()=>setView('My loans')}>View my loans →</button></div></>}</section>:view==='Reports'?<section className="panel report-panel"><div className="panel-title"><div><h2>Library reports & activity</h2><p>Live summaries from your browser records.</p></div><div className="report-actions"><button className="secondary small" onClick={exportCsv}><Download size={14}/> Export CSV</button><button className="primary small" onClick={exportData}><Download size={14}/> JSON backup</button></div></div><div className="report-grid"><article><span>Total books</span><b>{books.length}</b></article><article><span>Available</span><b>{available}</b></article><article><span>Issued</span><b>{issued}</b></article><article><span>Overdue</span><b className={overdue?'due-overdue':''}>{overdue}</b></article><article><span>Members</span><b>{members.length}</b></article><article><span>Availability</span><b>{books.length?Math.round(available/books.length*100):0}%</b></article></div><div className="panel-title"><div><h2>Recent activity</h2><p>Actions recorded in this browser.</p></div><button className="secondary small" onClick={()=>{if(confirm('Clear activity log?'))setActivity([])}}>Clear log</button></div><div className="activity-list">{activity.length?activity.slice(0,30).map(a=><div className="activity-row" key={a.id}><span className="activity-icon"><Check size={15}/></span><span><b>{a.text}</b><small>{new Date(a.at).toLocaleString()}</small></span><em>{a.kind}</em></div>):<div className="empty"><BarChart3/><b>No activity yet</b><p>Book and member actions appear here.</p></div>}</div></section>:view==='Member portal'?<section className="panel"><div className="panel-title"><div><h2>Member self-service</h2><p>Select a member to view current loans and renew them.</p></div><select value={portalMember} onChange={e=>setPortalMember(e.target.value)}><option value="">Choose member</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>{portalMember?members.filter(m=>m.id===portalMember).map(m=><div key={m.id}><div className="portal-profile"><span className="avatar">{m.name.charAt(0).toUpperCase()}</span><div><h2>{m.name}</h2><p>{m.studentId||'No campus ID'} · {m.department||'Department not set'} · {m.program||'Student'} · {m.email||'No email'}</p></div><span className="status available">{books.filter(b=>b.status==='Issued'&&b.memberId===m.id).length} active loan(s)</span></div><div className="table-scroll"><table><thead><tr><th>BOOK</th><th>DUE DATE</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{books.filter(b=>b.status==='Issued'&&b.memberId===m.id).map(b=><tr key={b.id}><td><div className="book"><span><b>{b.title}</b><small>{b.author}</small></span></div></td><td className={isOverdue(b)?'due-overdue':''}>{b.dueDate||'—'}</td><td><span className={'status '+(isOverdue(b)?'issued':'available')}>{isOverdue(b)?'Overdue':'On loan'}</span></td><td><button className="secondary small" onClick={()=>renewLoan(b)}>Renew for 14 days</button></td></tr>)}</tbody></table>{!books.some(b=>b.status==='Issued'&&b.memberId===m.id)&&<div className="empty"><BookOpen/><b>No active loans</b><p>This member has no books currently issued.</p></div>}</div></div>):<div className="empty"><Users/><b>Select a registered member</b><p>Their current loans will appear here.</p></div>}</section>:view==='Members'?<section className="panel"><div className="panel-title"><div><h2>Registered members</h2><p>Manage reader details and check who has active loans.</p></div><button className="primary small" onClick={addMember}><Plus size={15}/> Add member</button></div><div className="filters"><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, email, phone..."/></label><button className="secondary" onClick={exportData}><Download size={15}/> Export backup</button><button className="secondary" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Restore</button></div><div className="table-scroll"><table><thead><tr><th>MEMBER</th><th>EMAIL</th><th>PHONE</th><th>ACTIVE LOANS</th><th>JOINED</th><th>ACTIONS</th></tr></thead><tbody>{visibleMembers.map(m=><tr key={m.id}><td><div className="member-cell"><span className="avatar">{m.name.trim().charAt(0).toUpperCase()}</span><b>{m.name}</b></div></td><td>{m.email||'—'}</td><td>{m.phone||'—'}</td><td>{books.filter(b=>b.status==='Issued'&&b.memberId===m.id).length}</td><td>{m.joinedAt||'—'}</td><td><div className="actions"><button title="Edit member" onClick={()=>editMember(m)}><Pencil size={15}/></button><button title="Delete member" onClick={()=>deleteMember(m)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!visibleMembers.length&&<div className="empty"><Users/><b>No members found</b><p>Add a member or adjust your search.</p></div>}</div><div className="table-foot">Showing <b>{visibleMembers.length}</b> of <b>{members.length}</b> members <span>✓ Saved in this browser</span></div></section>:<section className="panel"><div className="panel-title"><div><h2>{view==='Issued books'?'Currently issued':view==='Overdue'?'Overdue loans':'Book catalogue'}</h2><p>Issue books to registered members and track due dates.</p></div><button className="primary small" onClick={addBook}><Plus size={15}/> Add a book</button></div><div className="filters"><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, author, ISBN, member..."/></label><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="All">All books</option><option>Available</option><option>Issued</option></select><button className="secondary" onClick={exportData}><Download size={15}/> Export backup</button><button className="secondary" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Restore</button><input hidden ref={fileRef} type="file" accept=".json,application/json" onChange={restoreData}/></div><div className="table-scroll"><table><thead><tr><th>BOOK</th><th>ISBN</th><th>CATEGORY</th><th>STATUS</th><th>MEMBER / DUE DATE</th><th>ACTIONS</th></tr></thead><tbody>{visibleBooks.map(b=><tr key={b.id}><td><div className="book"><span className="cover">{b.coverUrl?<img src={b.coverUrl} alt={b.title+' cover'} onError={(event) => { event.currentTarget.style.display = "none"; }}/>:<BookOpen size={17}/>}</span><span><b>{b.title}</b><small>{b.author}</small></span></div></td><td>{b.isbn||'—'}</td><td><span className="category">{b.category}</span></td><td><span className={`status ${b.status.toLowerCase()}`}>● {isOverdue(b)?'Overdue':b.status}</span></td><td>{b.status==='Issued'?<span className="borrower"><b>{memberFor(b)?.name||'Member record missing'}</b><small className={isOverdue(b)?'due-overdue':''}>{isOverdue(b)?'OVERDUE · ': 'Due '}{b.dueDate||'—'}</small></span>:'—'}</td><td><div className="actions"><button title={b.status==='Issued'?'Mark returned':'Issue book'} onClick={()=>startIssue(b)}>{b.status==='Issued'?<RotateCcw size={15}/>:<ArrowUpFromLine size={15}/>}</button><button title="Edit book" onClick={()=>editBook(b)}><Pencil size={15}/></button><button title="Delete book" onClick={()=>deleteBook(b)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{visibleBooks.length===0&&<div className="empty"><Search/><b>No books found</b><p>Try another search or add a book.</p></div>}</div><div className="table-foot">Showing <b>{visibleBooks.length}</b> of <b>{books.length}</b> books <span>✓ Saved in this browser</span></div></section>}
 <div className="bottom"><section className="panel summary"><h3>Collection overview</h3><p>Availability at a glance</p><div className="bar-label"><span>Available books</span><b>{books.length?Math.round(available/books.length*100):0}%</b></div><div className="bar"><span style={{width:`${books.length?available/books.length*100:0}%`}}/></div><small>Available: {available}　·　Issued: {issued}　·　Overdue: {overdue}</small></section><section className="panel backup"><h3>Backup & restore</h3><p>Export your books, members, and theme settings to one JSON file. Keep a copy somewhere safe.</p><button className="primary" onClick={exportData}><Download size={15}/> Download backup</button><button className="secondary" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Restore backup</button></section></div><footer>© {new Date().getFullYear()} LibraryHub <span>Free local-first edition · Data stays in this browser</span></footer></section></main>
 {bookModal&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setBookModal(false)}}><form className="modal" onSubmit={saveBook}><div className="modal-head"><div><p className="eyebrow">CATALOGUE ENTRY</p><h2>{editing?'Edit book details': 'Add a new book'}</h2></div><button type="button" className="x" onClick={()=>setBookModal(false)}><X/></button></div><div className="fields"><label className="wide">Book title *<input required maxLength={120} autoFocus value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="e.g. The Great Gatsby"/></label><label>Author *<input required value={draft.author} onChange={e=>setDraft({...draft,author:e.target.value})} placeholder="Author name"/></label><label>ISBN<input value={draft.isbn} onChange={e=>setDraft({...draft,isbn:e.target.value})} placeholder="ISBN number"/></label><label>Category<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}>{['Fiction','Non-fiction','Technology','Biography','Self Development','Lifestyle','Science','History','Children','Other'].map(c=><option key={c}>{c}</option>)}</select></label><label>Cover image URL<input type="url" value={draft.coverUrl} onChange={e=>setDraft({...draft,coverUrl:e.target.value})} placeholder="https://..."/></label><label>Status<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as Status,memberId:e.target.value==='Available'?'':draft.memberId,dueDate:e.target.value==='Available'?'':draft.dueDate})}><option>Available</option><option>Issued</option></select></label>{draft.status==='Issued'&&<><label>Registered member *<select required value={draft.memberId} onChange={e=>setDraft({...draft,memberId:e.target.value})}><option value="">Select member</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>Due date *<input required type="date" value={draft.dueDate} onChange={e=>setDraft({...draft,dueDate:e.target.value})}/></label></>}</div><div className="modal-actions"><span>* Required</span><button type="button" className="secondary" onClick={()=>setBookModal(false)}>Cancel</button><button className="primary" type="submit"><Check size={15}/>{editing?'Save changes':'Add book'}</button></div></form></div>}
 {memberModal&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setMemberModal(false)}}><form className="modal" onSubmit={saveMember}><div className="modal-head"><div><p className="eyebrow">MEMBER RECORD</p><h2>{editingMember?'Edit member':'Register a member'}</h2></div><button type="button" className="x" onClick={()=>setMemberModal(false)}><X/></button></div><div className="fields"><label className="wide">Full name *<input required autoFocus maxLength={120} value={memberDraft.name} onChange={e=>setMemberDraft({...memberDraft,name:e.target.value})} placeholder="Member full name"/></label><label>Student / Staff ID<input value={memberDraft.studentId} onChange={e=>setMemberDraft({...memberDraft,studentId:e.target.value})} placeholder="e.g. CSE2026001"/></label><label>Department<input value={memberDraft.department} onChange={e=>setMemberDraft({...memberDraft,department:e.target.value})} placeholder="e.g. Computer Science"/></label><label>Course / Program<input value={memberDraft.program} onChange={e=>setMemberDraft({...memberDraft,program:e.target.value})} placeholder="e.g. B.Tech"/></label><label className="wide">Email<input type="email" value={memberDraft.email} onChange={e=>setMemberDraft({...memberDraft,email:e.target.value})} placeholder="name@example.com"/></label><label>Phone<input value={memberDraft.phone} onChange={e=>setMemberDraft({...memberDraft,phone:e.target.value})} placeholder="Phone number"/></label><label>Joined date<input type="date" value={memberDraft.joinedAt} onChange={e=>setMemberDraft({...memberDraft,joinedAt:e.target.value})}/></label></div><div className="modal-actions"><span>* Required</span><button type="button" className="secondary" onClick={()=>setMemberModal(false)}>Cancel</button><button className="primary" type="submit"><Check size={15}/>{editingMember?'Save changes':'Add member'}</button></div></form></div>}
 {toast&&<div className="toast"><Check size={17}/>{toast}<button onClick={()=>setToast('')}><X size={15}/></button></div>}
 </div>;
}
