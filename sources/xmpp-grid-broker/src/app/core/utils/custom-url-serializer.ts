import {DefaultUrlSerializer, UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from '@angular/router';


/**
 * The custom URL-Serializer is required as URL parameters
 * can contain special characters (`#`, `(`, `)` etc.) that
 * won't work with the default serializer.
 *
 * Note that this implementation might have limited support
 * for other angular and url features such as fragments or
 * query params.
 */
export class CustomUrlSerializer implements UrlSerializer {
  private defaultUrlSerializer: DefaultUrlSerializer;

  constructor() {
    this.defaultUrlSerializer = new DefaultUrlSerializer();
  }

  public parse(url: string): UrlTree {
    // Generate a new url tree
    const tree = this.defaultUrlSerializer.parse(url);

    // override the segments with "manually" generated ones
    const segments = url.split('/')
      .filter(path => path.length !== 0)
      .map(path => {
        try {
          return new UrlSegment(decodeURIComponent(path), {});
        } catch (URIError) {
          return new UrlSegment(path, {});
        }
      });
    tree.root = new UrlSegmentGroup(segments, {});

    return tree;
  }

  public serialize(tree: UrlTree): any {

    const serialized = this.segmentToUrl(tree.root);
    if (serialized === '') {
      return '/';
    } else {
      return serialized;
    }
  }

  private segmentToUrl(segment: UrlSegmentGroup) {
    const res = segment.segments.map((s) => encodeURIComponent(s.path)).join('/');
    if (segment.children && segment.children['primary']) {
      return res + '/' + this.segmentToUrl(segment.children['primary']);
    }
    return res;
  }
}
