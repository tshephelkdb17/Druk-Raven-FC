import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {name:'Druk Raven Football Club',short_name:'DRFC',description:'The home of the Ravens',start_url:'/',display:'standalone',background_color:'#0c0c0c',theme_color:'#c70101',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]}}
