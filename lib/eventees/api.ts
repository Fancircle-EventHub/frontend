/** Framework-neutral client. Inject a short-lived token from the authenticated session. */
export type Envelope<T> = { success: boolean; message: string; data: T };
export type Page<T> = { items: T[]; pagination: { current_page: number; last_page: number; total: number; per_page?: number } };
export type CatalogEvent = { id: string; title: string; category: 'music'|'sport'|'festival'|'culture'|'other'; city: string; venue: string|null; starts_at: string; status: string; hub: { id: string; community_ready: boolean } };
export type PublicFan = { id: string; username: string; city?: string; area?: string; seat_row?: string; seat_number?: string; interests?: string[]; allow_contact_requests: boolean };
export type Contact = { id: string; sender_id: string; recipient_id: string; status: 'pending'|'accepted'|'rejected'; created_at: string };
export type DiscoveryUpdate = Partial<{ city: string; area: string; seat_row: string; seat_number: string; interests: string[]; discoverable: boolean; share_city: boolean; share_area: boolean; share_seat: boolean; share_interests: boolean; allow_contact_requests: boolean }>;
export class EventeesApiError extends Error { constructor(public readonly status: number, message: string) { super(message); this.name='EventeesApiError'; } }
export function createEventeesApi(baseUrl: string, token: () => string | undefined = () => undefined) {
 const url = new URL(baseUrl);
 if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1','10.0.2.2'].includes(url.hostname))) throw new Error('HTTPS required for Eventees API.');
 async function request<T>(path: string, method='GET', data?: unknown, signal?: AbortSignal): Promise<T> {
  const credential=token();
  const response=await fetch(baseUrl.replace(/\/$/,'')+path,{method,signal:signal??AbortSignal.timeout(15000),headers:{Accept:'application/json',...(data===undefined?{}:{'Content-Type':'application/json'}),...(credential?{Authorization:`Bearer ${credential}`}:{})},...(data===undefined?{}:{body:JSON.stringify(data)})});
  const envelope=await response.json() as Envelope<T>;
  if (!response.ok||!envelope.success) throw new EventeesApiError(response.status,envelope.message||'Request failed.');
  return envelope.data;
 }
 const scope=(code:string)=>`/guest/events/${encodeURIComponent(code)}`;
 return {
  catalog:(params:Record<string,string>={},signal?:AbortSignal)=>request<Page<CatalogEvent>>('/catalog/events?'+new URLSearchParams(params),'GET',undefined,signal),
  event:(id:string,signal?:AbortSignal)=>request<CatalogEvent>('/catalog/events/'+encodeURIComponent(id),'GET',undefined,signal),
  fans:(code:string,filter:'all'|'area'|'city'|'interests'='all',page=1)=>request<Page<PublicFan>>(scope(code)+`/fans?filter=${filter}&page=${page}`),
  updateDiscovery:(code:string,data:DiscoveryUpdate)=>request<DiscoveryUpdate>(scope(code)+'/discovery-profile','PATCH',data),
  contacts:(code:string)=>request<Page<Contact>>(scope(code)+'/contacts'),
  requestContact:(code:string,targetId:string)=>request<Contact>(scope(code)+'/contacts','POST',{target_id:targetId}),
  respondContact:(code:string,id:string,status:'accepted'|'rejected')=>request<Contact>(scope(code)+'/contacts/'+encodeURIComponent(id),'PATCH',{status}),
 };
}
