# Generated by Django 2.1.7 on 2019-02-21 18:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('key', '0006_auto_20190221_1213'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentsuggestions',
            name='id',
            field=models.AutoField(default=None, primary_key=True, serialize=False, unique=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='studentsuggestions',
            name='match_key',
            field=models.TextField(),
        ),
    ]
