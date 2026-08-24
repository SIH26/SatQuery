from torch.utils.data import Dataset, DataLoader

class BigEarthNetDataset(Dataset):
    """
    Stub for BigEarthNet dataset representation.
    Will be used for Phase 2 domain adaptation.
    """
    def __init__(self, root_dir, split="train", transform=None):
        self.root_dir = root_dir
        self.split = split
        self.transform = transform
        # TODO: Load LMDB or raw GeoTIFF indices
        self.samples = []

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        # Return standardized sample: optical tensor, multi-label tensor
        pass

class RSVQADataset(Dataset):
    """
    Stub for RSVQA dataset. 
    Used for single-image VQA baseline.
    """
    def __init__(self, root_dir, split="train", transform=None):
        self.root_dir = root_dir
        self.samples = []

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        pass

class CDVQADataset(Dataset):
    """
    Stub for CDVQA dataset.
    Used for Bi-temporal change-based VQA.
    """
    def __init__(self, root_dir, split="train", transform=None):
        self.root_dir = root_dir
        self.samples = []

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        pass

class VRSBenchDataset(Dataset):
    """
    Stub for VRSBench dataset.
    Used for Grounding and Captioning tasks.
    """
    def __init__(self, root_dir, split="train", transform=None):
        self.root_dir = root_dir
        self.samples = []

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        pass
