export type UploadType = "organization_logo" | "event_cover" | "event_logo";

export type PresignUploadPayload = {
  type: UploadType;
  filename: string;
  content_type: string;
  event_id?: string;
  byte_size?: number;
};

export type PresignUploadData = {
  key: string;
  upload_url: string;
  headers: Record<string, string>;
  expires_at: string;
  visibility: "public" | "private";
  public_url: string | null;
};

export type PresignDownloadData = {
  key: string;
  download_url: string;
  expires_at: string | null;
  visibility: "public" | "private";
};
