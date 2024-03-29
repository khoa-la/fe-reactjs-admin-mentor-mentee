export type TCourse = {
  id: number;
  name: string;
  minQuantity: number;
  maxQuantity: number;
  price: number;
  slug: string;
  imageUrl: string[];
  startDate: string;
  finishDate: string;
  createDate: string;
  updateDate?: string;
  status: number;
  type: number;
  locationType: number;
  location: string;
  desciption: string;
  totalRating: number;
  mentorId: number;
  subjectId: number;
};
