import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    // Convertir URL de YouTube para embeber
    if (url && url.includes('youtube.com/watch?v=')) {
      url = url.replace('watch?v=', 'embed/');
    } else if (url && url.includes('youtu.be/')) {
      url = url.replace('youtu.be/', 'youtube.com/embed/');
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
