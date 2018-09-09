using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage.Blob;

namespace stuffonharoldnet.Services {
	public interface IKnowAzureImages{
		Task<List<string>> GetImageNames();

		Task<byte[]> GetImage(string uri);
	}
	public class AzureImageService : IKnowAzureImages {

		readonly CloudBlobContainer _blobContainer;

		public AzureImageService(CloudBlobContainer blobContainer) {
			_blobContainer = blobContainer;
		}

		public async Task<List<string>> GetImageNames(){
			BlobContinuationToken blobContinuationToken = null;
			var blobs = await _blobContainer.ListBlobsSegmentedAsync(null, blobContinuationToken);
			return blobs.Results.Select(r => r.Uri.Segments.Last()).ToList();
		}

		public async Task<byte[]> GetImage(string uri){
			var blockBlob = _blobContainer.GetBlockBlobReference(uri);

			var blob = _blobContainer.GetBlobReference(uri);

			byte[] data = new byte[blob.StreamMinimumReadSizeInBytes];

			await blob.DownloadToByteArrayAsync(data, 0);

			return data;
		}

	}
}
