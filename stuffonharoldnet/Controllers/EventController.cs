using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace stuffonharoldnet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {

        [HttpPost("imagechanged", Name = "ImageChanged")]
        public async Task<IActionResult> ImageChanged(ImageChangeEvent imageChangedEvent)
        {
            return this.Ok(imageChangedEvent);
        }

        public class ImageChangeEvent
        {
            public ImageChangeAction Event { get; set; }
            public string Image { get; set; }
        }

        public enum ImageChangeAction
        {
            SwipeLeft,
            SwipeRight,
            Shake
        }
    }
}
