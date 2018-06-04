import { hotReloadExternalStyle } from '../app-hot-reload';


describe('app-hot-reload', () => {

  describe('hotReloadExternalStyle', () => {
    const versionId = '1234';

    it('update existing qs', () => {
      const styleSheet = { href: './file-a.css?s-v=4321&what=ever' } as HTMLLinkElement;
      const updatedUrl = './file-a.css';

      hotReloadExternalStyle(versionId, styleSheet, updatedUrl);

      expect(styleSheet.href).toBe('./file-a.css?s-v=1234&what=ever');
    });

    it('add to existing qs', () => {
      const styleSheet = { href: './file-a.css?what=ever' } as HTMLLinkElement;
      const updatedUrl = './file-a.css';

      hotReloadExternalStyle(versionId, styleSheet, updatedUrl);

      expect(styleSheet.href).toBe('./file-a.css?what=ever&s-v=1234');
    });

    it('update no prefix . or / relative href', () => {
      const styleSheet = { href: 'file-a.css' } as HTMLLinkElement;
      const updatedUrl = 'file-a.css';

      hotReloadExternalStyle(versionId, styleSheet, updatedUrl);

      expect(styleSheet.href).toBe('file-a.css?s-v=1234');
    });

    it('update exact href', () => {
      const styleSheet = { href: '/build/file-a.css' } as HTMLLinkElement;
      const updatedUrl = '/build/file-a.css';

      hotReloadExternalStyle(versionId, styleSheet, updatedUrl);

      expect(styleSheet.href).toBe('/build/file-a.css?s-v=1234');
    });

    it('not update href', () => {
      const styleSheet = { href: '/build/file-a.css' } as HTMLLinkElement;
      const updatedUrl = '/build/file-b.css';

      hotReloadExternalStyle(versionId, styleSheet, updatedUrl);

      expect(styleSheet.href).toBe('/build/file-a.css');
    });

  });

});
