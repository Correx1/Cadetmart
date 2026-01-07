import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schema } from './schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'CadetMart',

  projectId: 'votyhd1p',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema,
  
  // Prevent product deletion
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'product') {
        return prev.filter(
          (action) => action.action !== 'delete' && action.name !== 'delete'
        );
      }
      return prev;
    },
  },
});
