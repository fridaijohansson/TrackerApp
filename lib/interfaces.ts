

export interface ImageData {
    id: string;
    image_url: string | null;
    created_at: string;
    prompt_text: string;
    review: any;
    status: 'completed' | 'missed' | 'ongoing';
  }
  
  export interface MonthGroup {
    month: string;
    images: ImageData[];
  }
  
  export interface YearGroup {
    year: string;
    months: MonthGroup[];
  }
  
  export interface ImageItemProps {
    item: {
      image_url: string;
      status: string
    };
    index: number;
    onPress: (index: number) => void;
    getSignedUrl: (path: string) => Promise<string | null>;
  }