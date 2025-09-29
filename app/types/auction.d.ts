export interface Auction {
  id: number;
  title: string;
  location: string;
  auctionNumber: string;
  details: string;
  timeLeft: string;
  endTime: string;
  activeBids: number;
  currentBid: string;
  images: string[];
  brand: string;
  brandColor: string;
}
