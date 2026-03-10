import warnings
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Cosmii"
    debug: bool = False

    data_dir: Path = Path(__file__).resolve().parent.parent / "data"
    books_dir: Path = data_dir / "books"
    covers_dir: Path = data_dir / "covers"

    llm_model: str = "gpt-4o-mini"
    llm_api_key: str = ""
    embedding_model: str = "text-embedding-3-small"

    chunk_size: int = 600
    chunk_overlap: int = 100

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""

    model_config = {"env_prefix": "COSMII_", "env_file": ".env"}

    def validate_api_key(self) -> None:
        if not self.llm_api_key:
            raise RuntimeError(
                "COSMII_LLM_API_KEY is not set. "
                "Set it in .env or as an environment variable."
            )

    def validate_supabase(self) -> None:
        if not self.supabase_url or not self.supabase_service_key:
            raise RuntimeError(
                "Supabase credentials not set. "
                "Set COSMII_SUPABASE_URL and COSMII_SUPABASE_SERVICE_KEY in .env"
            )


settings = Settings()
if not settings.llm_api_key:
    warnings.warn(
        "COSMII_LLM_API_KEY is empty — LLM calls will fail.",
        stacklevel=2,
    )
if not settings.supabase_url:
    warnings.warn(
        "COSMII_SUPABASE_URL is empty — DB operations will fail.",
        stacklevel=2,
    )
