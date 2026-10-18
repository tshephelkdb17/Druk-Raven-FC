import type {PlayerView,StaffView,VideoView} from './types';
// Presentation fixtures only: these are NOT an import of the live Supabase roster.
export const demoPlayers: PlayerView[] = [
  {id:'preview-17',slug:'player-17',name:'Player 17',number:17,position:'FORWARD',portrait:'/players/17_1.jpg'},
  {id:'preview-13',slug:'player-13',name:'Player 13',number:13,position:'MIDFIELDER',portrait:'/players/13_1.JPG'},
  {id:'preview-1',slug:'goalkeeper-preview',name:'Goalkeeper preview',number:1,position:'GOALKEEPER',portrait:null},
  {id:'preview-4',slug:'defender-preview',name:'Defender preview',number:4,position:'DEFENDER',portrait:null},
].map(p=>({...p,biography:'Preview profile. Connect your club database to publish the real player biography and statistics.',nationality:null,heightCm:null,dateOfBirth:null,goals:0,assists:0,gallery:[]} as PlayerView));
export const demoStaff:StaffView[] = [
  ['executive','Club leadership','EXECUTIVE'],['manager','First-team manager','COACHING'],['assistant','Assistant coach','COACHING'],['medical','Medical team','MEDICAL'],['kit','Kit manager','KIT'],
].map(([slug,role,group])=>({id:slug,slug,name:'To be announced',role,group:group as StaffView['group'],portrait:null,biography:'The club can publish this staff profile when details are available.'}));
export const demoVideos:VideoView[] = [{id:'club-film',slug:'from-the-touchline',title:'From the touchline',description:'A moment from the pitch. Footage supplied by Druk Raven Football Club.',category:'CLUB',thumbnail:'/images/club-film-poster.jpg',durationSeconds:13,source:'UPLOAD',url:'/videos/club-film.mp4',providerId:null}];
