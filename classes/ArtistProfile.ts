
import { ArtistProfileData } from '../types';


export class ArtistProfile implements ArtistProfileData {
    mediums: string[];
    styles: string[];
    subjects: string[];
  
    constructor() {
      this.mediums = [];
      this.styles = [];
      this.subjects = [];
    }

    
  
    toJSON(): ArtistProfileData {
      return {
        mediums: this.mediums,
        styles: this.styles,
        subjects: this.subjects
      };
    }
  }