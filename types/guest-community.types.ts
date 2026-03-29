export type GuestCommunityTopUploader = {
  guest_id: string;
  username: string | null;
  image_upload_count: number;
  avatar_url: string | null;
};

export type GuestCommunityStats = {
  fan_count: number;
  top_image_uploaders: GuestCommunityTopUploader[];
};
